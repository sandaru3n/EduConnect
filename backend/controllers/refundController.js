// backend/controllers/refundController.js
const RefundRequest = require('../models/RefundRequest');
const StudentSubscription = require('../models/StudentSubscription');
const Class = require('../models/Class');

// Student submits a refund request
exports.requestRefund = async (req, res) => {
    const { classId, reason } = req.body;
    const studentId = req.user.id;

    try {
        const subscription = await StudentSubscription.findOne({ userId: studentId, classId });
        if (!subscription) {
            return res.status(404).json({ message: 'Subscription not found' });
        }

        const classData = await Class.findById(classId).populate('teacherId', 'name');
        if (!classData) {
            return res.status(404).json({ message: 'Class not found' });
        }

        // Check if a proof file was uploaded
        let proofPath = null;
        if (req.file) {
            proofPath = `/uploads/refunds/${req.file.filename}`;
        }

        const refundRequest = new RefundRequest({
            studentId,
            classId,
            subscriptionId: subscription._id,
            reason,
            classFee: subscription.feePaid,
            proof: proofPath // Store the proof file path
        });

        await refundRequest.save();
        res.status(201).json({ message: 'Refund request submitted successfully', refundRequest });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error submitting refund request', error: error.message });
    }
};

// Admin views all refund requests
exports.getRefundRequests = async (req, res) => {
    try {
        const refundRequests = await RefundRequest.find()
            .populate('studentId', 'name')
            .populate('classId', 'subject teacherId')
            .populate({
                path: 'classId',
                populate: { path: 'teacherId', select: 'name' }
            });
        res.status(200).json(refundRequests);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching refund requests', error: error.message });
    }
};

// Admin approves or rejects a refund request
exports.updateRefundStatus = async (req, res) => {
    const { refundId, status } = req.body;

    try {
        const refundRequest = await RefundRequest.findById(refundId);
        if (!refundRequest) {
            return res.status(404).json({ message: 'Refund request not found' });
        }

        refundRequest.status = status;
        await refundRequest.save();

        if (status === 'Approved') {
            // Set the subscription to Inactive when refund is approved
            const subscription = await StudentSubscription.findByIdAndUpdate(
                refundRequest.subscriptionId,
                { status: 'Inactive' },
                { new: true }
            );
            if (!subscription) {
                return res.status(404).json({ message: 'Subscription not found for update' });
            }
        }
        // If status is 'Rejected', no action is taken on the subscription

        res.status(200).json({ 
            message: `Refund request ${status.toLowerCase()} successfully`, 
            refundRequest 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating refund status', error: error.message });
    }
};

// Student views their refund requests
exports.getStudentRefundRequests = async (req, res) => {
    const studentId = req.user.id;

    try {
        const refundRequests = await RefundRequest.find({ studentId })
            .populate('classId', 'subject');
        res.status(200).json(refundRequests);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching refund requests', error: error.message });
    }
};
