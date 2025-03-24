//backend/controllers/stusubscriptionController.js
const StudentSubscription = require('../models/StudentSubscription');
const Class = require('../models/Class');

exports.getMyClasses = async (req, res) => {
    try {
        const StudentSubscriptions = await StudentSubscription.find({ userId: req.user.id, status: 'Active' });
        const classIds = StudentSubscriptions.map(sub => sub.classId);
        const classes = await Class.find({ _id: { $in: classIds } }).populate('teacherId', 'name');
        res.status(200).json(classes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching subscribed classes' });
    }
};

exports.getPaymentHistory = async (req, res) => {
    try {
      const payments = await StudentSubscription.find({ userId: req.user.id })
        .populate({
          path: 'classId',
          select: 'subject teacherId',
          populate: {
            path: 'teacherId',
            select: 'name',
          },
        })
        .sort({ createdAt: -1 });
  
      if (!payments.length) {
        return res.status(200).json([]);
      }
  
      res.status(200).json(payments);
    } catch (error) {
      console.error('Error fetching payment history:', error);
      res.status(500).json({ message: 'Server error fetching payment history' });
    }
  };

//
exports.getMyClasses = async (req, res) => {
    try {
        const studentSubscriptions = await StudentSubscription.find({ 
            userId: req.user.id, 
            status: 'Active' // Only return active subscriptions
        });
        const classIds = studentSubscriptions.map(sub => sub.classId);
        const classes = await Class.find({ _id: { $in: classIds } }).populate('teacherId', 'name');
        res.status(200).json(classes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching subscribed classes' });
    }
};
