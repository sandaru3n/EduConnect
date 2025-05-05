// backend/controllers/paymentController.js
const StudentSubscription = require('../models/StudentSubscription');
const Class = require('../models/Class');
const User = require("../models/User");
const Subscription = require("../models/Subscription");
const StudyPack = require('../models/StudyPack'); // Add this line
const StudyPackSubscription = require('../models/StudyPackSubscription'); // Add this line
const FeeWaiver = require('../models/FeeWaiver');
const mongoose = require('mongoose'); // Ensure this line is present
const sendEmail = require('../config/email');

exports.subscribeToClass = async (req, res) => {
  const { classId, cardNumber, expiryDate, cvv } = req.body;
  const userId = req.user.id;

  // Custom card validation
  if (!validateCard(cardNumber, expiryDate, cvv)) {
      return res.status(400).json({ message: 'Invalid card details' });
  }

  // Simulate payment processing
  const paymentSuccess = processPayment(cardNumber);
  if (!paymentSuccess) {
      return res.status(500).json({ message: 'Payment processing failed' });
  }

  try {
      const classData = await Class.findById(classId).populate('teacherId', 'name');
      if (!classData) {
          return res.status(404).json({ message: 'Class not found' });
      }

      const user = await User.findById(userId);
      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }

      // Fetch student's approved fee waiver for this specific class (if any)
      const feeWaiver = await FeeWaiver.findOne({ studentId: userId, classId, status: "Approved" });

      // Calculate discounted fee
      let finalFee = classData.monthlyFee;
      let discountPercentage = 0;
      if (feeWaiver && feeWaiver.discountPercentage > 0) {
          discountPercentage = feeWaiver.discountPercentage;
          finalFee = classData.monthlyFee * (1 - discountPercentage / 100);
      }

      let subscription = await StudentSubscription.findOne({ userId, classId });
      if (subscription) {
          // If subscription exists (inactive), reactivate it
          if (subscription.status === 'Inactive') {
              subscription.status = 'Active';
              subscription.feePaid = Math.round(finalFee); // Apply discount to reactivated subscription
              subscription.createdAt = new Date();
              await subscription.save();

              // Send reactivation email
              await sendEmail(
                  user.email,
                  'Class Subscription Reactivated',
                  `Hello ${user.name},\n\nYour subscription to the class "${classData.subject}" taught by ${classData.teacherId.name} has been successfully reactivated. The monthly fee of $${classData.monthlyFee} has been reduced to $${Math.round(finalFee)} due to a ${discountPercentage}% fee waiver.\n\nHappy Learning!\nEduConnect Team`,
                  `<h2>Class Subscription Reactivated</h2><p>Hello ${user.name},</p><p>Your subscription to the class "<strong>${classData.subject}</strong>" taught by <strong>${classData.teacherId.name}</strong> has been successfully reactivated. The monthly fee of <strong>$${classData.monthlyFee}</strong> has been reduced to <strong>$${Math.round(finalFee)}</strong> due to a <strong>${discountPercentage}%</strong> fee waiver.</p><p>Happy Learning!<br>EduConnect Team</p>`
              );

              return res.status(200).json({ 
                  message: 'Subscription reactivated successfully', 
                  subscriptionId: subscription._id,
                  originalFee: classData.monthlyFee,
                  finalFee: Math.round(finalFee),
                  discountPercentage
              });
          } else {
              return res.status(400).json({ message: 'Already subscribed to this class' });
          }
      }

      // Create new subscription if none exists
      subscription = new StudentSubscription({
          userId,
          classId,
          feePaid: Math.round(finalFee), // Apply discount to new subscription
      });
      await subscription.save();

      // Send confirmation email
      await sendEmail(
          user.email,
          'Class Subscription Confirmation',
          `Hello ${user.name},\n\nYou have successfully subscribed to the class "${classData.subject}" taught by ${classData.teacherId.name}. The monthly fee of $${classData.monthlyFee} has been reduced to $${Math.round(finalFee)} due to a ${discountPercentage}% fee waiver.\n\nHappy Learning!\nEduConnect Team`,
          `<h2>Class Subscription Confirmation</h2><p>Hello ${user.name},</p><p>You have successfully subscribed to the class "<strong>${classData.subject}</strong>" taught by <strong>${classData.teacherId.name}</strong>. The monthly fee of <strong>$${classData.monthlyFee}</strong> has been reduced to <strong>$${Math.round(finalFee)}</strong> due to a <strong>${discountPercentage}%</strong> fee waiver.</p><p>Happy Learning!<br>EduConnect Team</p>`
      );

      res.status(201).json({ 
          message: 'Subscription successful', 
          subscriptionId: subscription._id,
          originalFee: classData.monthlyFee,
          finalFee: Math.round(finalFee),
          discountPercentage
      });
  } catch (error) {
      console.error("Subscribe to class error:", error);
      res.status(500).json({ message: 'Error processing subscription', error: error.message });
  }
};

exports.processSubscriptionPayment = async (req, res) => {
    const { userId, subscriptionId, cardNumber, expiryDate, cvv } = req.body;

    if (!validateCard(cardNumber, expiryDate, cvv)) {
        return res.status(400).json({ message: "Invalid card details" });
    }

    const paymentSuccess = processPayment(cardNumber); // Simulated payment gateway
    if (!paymentSuccess) {
        return res.status(500).json({ message: "Payment processing failed" });
    }

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        const subscription = await Subscription.findById(subscriptionId);
        if (!subscription) return res.status(404).json({ message: "Subscription not found" });

        user.subscriptionId = subscriptionId;
        user.subscriptionStatus = "active";
        await user.save();

        res.status(200).json({ message: "Subscription activated successfully", user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error processing subscription", error: error.message });
    }
};

exports.subscribeToStudyPack = async (req, res) => {
    const { studyPackId, cardNumber, expiryDate, cvv } = req.body;
    const userId = req.user?.id;
  
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
  
    if (!mongoose.Types.ObjectId.isValid(studyPackId)) {
      return res.status(400).json({ message: 'Invalid study pack ID' });
    }
  
    if (!validateCard(cardNumber, expiryDate, cvv)) {
      return res.status(400).json({ message: 'Invalid card details' });
    }
  
    const paymentSuccess = processPayment(cardNumber);
    if (!paymentSuccess) {
      return res.status(500).json({ message: 'Payment processing failed' });
    }
  
    try {
      const studyPack = await StudyPack.findById(studyPackId);
      if (!studyPack) {
        return res.status(404).json({ message: 'Study pack not found' });
      }
  
      let subscription = await StudyPackSubscription.findOne({ userId, studyPackId }); // Use new model
      if (subscription) {
        if (subscription.status === 'Inactive') {
          subscription.status = 'Active';
          subscription.feePaid = studyPack.price;
          subscription.createdAt = new Date();
          await subscription.save();
          return res.status(200).json({ message: 'Subscription reactivated', subscriptionId: subscription._id });
        } else {
          return res.status(400).json({ message: 'Already subscribed to this study pack' });
        }
      }
  
      subscription = new StudyPackSubscription({
        userId,
        studyPackId, // Use studyPackId instead of classId
        feePaid: studyPack.price,
      });
      await subscription.save();
      res.status(201).json({ message: 'Subscription successful', subscriptionId: subscription._id });
    } catch (error) {
      console.error('Error in subscribeToStudyPack:', error);
      res.status(500).json({ message: 'Error processing subscription', error: error.message });
    }
  };

  // New endpoint to fetch class details for payment form
exports.getClassDetails = async (req, res) => {
  try {
      const { classId } = req.params;
      const userId = req.user.id;

      // Fetch class details with teacher name
      const classData = await Class.findById(classId).populate('teacherId', 'name');
      if (!classData) {
          return res.status(404).json({ message: 'Class not found' });
      }

      // Fetch student's approved fee waiver for this specific class (if any)
      const feeWaiver = await FeeWaiver.findOne({ studentId: userId, classId, status: "Approved" });

      // Calculate discounted fee
      let finalFee = classData.monthlyFee;
      let discountPercentage = 0;
      if (feeWaiver && feeWaiver.discountPercentage > 0) {
          discountPercentage = feeWaiver.discountPercentage;
          finalFee = classData.monthlyFee * (1 - discountPercentage / 100);
      }

      const classDetails = {
          className: classData.subject,
          teacherName: classData.teacherId.name,
          monthlyFee: classData.monthlyFee,
          finalFee: Math.round(finalFee),
          discountPercentage,
          description: classData.description,
          coverPhoto: classData.coverPhoto || null,
      };

      res.status(200).json(classDetails);
  } catch (error) {
      console.error("Error fetching class details:", error);
      res.status(500).json({ message: "Error fetching class details", error: error.message });
  }
};

  // New endpoint to fetch receipt details for a specific payment
exports.getReceiptDetails = async (req, res) => {
  try {
      const { subscriptionId } = req.params;
      const userId = req.user.id;

      const subscription = await StudentSubscription.findOne({ _id: subscriptionId, userId })
          .populate({
              path: 'classId',
              populate: { path: 'teacherId', select: 'name' }
          })
          .populate('userId', 'name email');

      if (!subscription) {
          return res.status(404).json({ message: "Subscription not found" });
      }

      // Fetch fee waiver details if any
      const feeWaiver = await FeeWaiver.findOne({ studentId: userId, classId: subscription.classId._id, status: "Approved" });

      // Calculate original fee, discount, and final fee
      const originalFee = subscription.classId.monthlyFee;
      let discountPercentage = feeWaiver ? feeWaiver.discountPercentage : 0;
      let finalFee = subscription.feePaid; // Already includes discount if applied

      // Generate a random 7-digit invoice number
      const randomNumber = Math.floor(1000000 + Math.random() * 9000000); // Random 7-digit number
      const invoiceNumber = `INV-${randomNumber}`;

      const receiptDetails = {
          invoiceNumber: invoiceNumber,
          studentName: subscription.userId.name,
          studentEmail: subscription.userId.email,
          className: subscription.classId.subject,
          teacherName: subscription.classId.teacherId.name,
          originalFee: originalFee,
          discountPercentage: discountPercentage,
          finalFee: finalFee,
          paymentDate: subscription.createdAt,
          paymentMethod: subscription.paymentMethod || "Credit Card", // Assumed if not stored
          status: subscription.status
      };

      res.status(200).json(receiptDetails);
  } catch (error) {
      console.error("Error fetching receipt details:", error);
      res.status(500).json({ message: "Error fetching receipt details", error: error.message });
  }
};


exports.getStudyPackDetails = async (req, res) => {
    try {
      const { studyPackId } = req.params;
      const userId = req.user.id;
  
      const studyPack = await StudyPack.findById(studyPackId);
      if (!studyPack) {
        return res.status(404).json({ message: 'Study pack not found' });
      }
  
      const studyPackDetails = {
        title: studyPack.title,
        subject: studyPack.subject,
        price: studyPack.price,
        fileCount: studyPack.fileCount,
        coverPhoto: studyPack.coverPhotoPath ? `http://localhost:5000${studyPack.coverPhotoPath}` : null, // Use coverPhotoPath and rename to coverPhoto
      };
  
      res.status(200).json(studyPackDetails);
    } catch (error) {
      console.error("Error fetching study pack details:", error);
      res.status(500).json({ message: "Error fetching study pack details", error: error.message });
    }
  };


// Simple card validation function (unchanged)
function validateCard(cardNumber, expiryDate, cvv) {
    const cardRegex = /^\d{16}$/;
    const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
    const cvvRegex = /^\d{3,4}$/;
    return cardRegex.test(cardNumber) && expiryRegex.test(expiryDate) && cvvRegex.test(cvv);
}

// Simulate payment success (unchanged)
function processPayment(cardNumber) {
    return cardNumber.length === 16; // Dummy success condition
}
