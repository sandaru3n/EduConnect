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
        const StudentSubscriptions = await StudentSubscription.find({ userId: req.user.id })
            .populate({
                path: 'classId',
                select: 'subject monthlyFee',
                populate: {
                    path: 'teacherId',
                    select: 'name'
                }
            });
        res.status(200).json(StudentSubscriptions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching payment history' });
    }
};
