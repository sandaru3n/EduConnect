const StudentSubscription = require('../models/StudentSubscription');
const Class = require('../models/Class');

exports.getSubscribedStudents = async (req, res) => {
    try {
        const teacherId = req.user.id;

        // Find all classes owned by the teacher
        const classes = await Class.find({ teacherId });
        const classIds = classes.map(cls => cls._id);

        // Find all subscriptions for those classes
        const subscriptions = await StudentSubscription.find({ classId: { $in: classIds } })
            .populate("userId", "name email")
            .populate("classId", "subject");

        res.status(200).json(subscriptions);
    } catch (error) {
        console.error("Get subscribed students error:", error);
        res.status(500).json({ message: "Error retrieving subscribed students", error: error.message });
    }
};

module.exports = exports;