//backend/controllers/stusubscriptionController.js
const StudentSubscription = require('../models/StudentSubscription');
const Class = require('../models/Class');
const FeeWaiver = require('../models/FeeWaiver');

exports.getMyClasses = async (req, res) => {
  try {
      const userId = req.user.id;

      // Fetch student's approved fee waiver (if any)
      const feeWaiver = await FeeWaiver.findOne({ studentId: userId, status: "Approved" });

      // Fetch active subscriptions
      const studentSubscriptions = await StudentSubscription.find({ userId, status: 'Active' });
      const classIds = studentSubscriptions.map(sub => sub.classId);

      // Fetch classes with their subscription fees
      const classes = await Class.find({ _id: { $in: classIds } }).populate('teacherId', 'name');

      // Apply discount to class fees if fee waiver exists
      const classesWithFees = classes.map(cls => {
          const subscription = studentSubscriptions.find(sub => sub.classId.toString() === cls._id.toString());
          let discountedFee = subscription.feePaid; // Use the fee paid at subscription time
          const originalFee = cls.monthlyFee; // Original fee from Class model

          if (feeWaiver && feeWaiver.discountPercentage > 0) {
              // Recalculate the discounted fee for display purposes
              discountedFee = originalFee * (1 - feeWaiver.discountPercentage / 100);
          }

          return {
              ...cls._doc,
              originalFee,
              discountedFee: Math.round(discountedFee),
              subscriptionFeePaid: subscription.feePaid // Fee paid at the time of subscription
          };
      });

      res.status(200).json(classesWithFees);
  } catch (error) {
      console.error("Get my classes error:", error);
      res.status(500).json({ message: "Error fetching subscribed classes", error: error.message });
  }
};

exports.getPaymentHistory = async (req, res) => {
  try {
      const payments = await StudentSubscription.find({ userId: req.user.id })
          .populate({
              path: 'classId',
              select: 'subject teacherId coverPhoto monthlyFee description', // Include coverPhoto and other relevant fields
              populate: {
                  path: 'teacherId',
                  select: 'name',
              },
          })
          .sort({ createdAt: -1 });

      if (!payments.length) {
          return res.status(200).json([]);
      }

      // Map the payments to ensure the response includes the expected fields
      const formattedPayments = payments.map(payment => ({
          _id: payment._id,
          classId: payment.classId ? {
              _id: payment.classId._id,
              subject: payment.classId.subject,
              coverPhoto: payment.classId.coverPhoto,
              monthlyFee: payment.classId.monthlyFee,
              description: payment.classId.description,
              teacherId: payment.classId.teacherId ? {
                  _id: payment.classId.teacherId._id,
                  name: payment.classId.teacherId.name,
              } : null,
          } : null,
          feePaid: payment.feePaid || payment.classId?.monthlyFee || 0, // Ensure feePaid is set
          status: payment.status,
          createdAt: payment.createdAt,
      }));

      res.status(200).json(formattedPayments);
  } catch (error) {
      console.error('Error fetching payment history:', error);
      res.status(500).json({ message: 'Server error fetching payment history' });
  }
};

//
