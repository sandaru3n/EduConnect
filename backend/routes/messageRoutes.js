// backend/routes/messageRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const Message = require('../models/Message');
const Class = require('../models/Class');
const StudentSubscription = require('../models/StudentSubscription');
const User = require('../models/User');

// Send a message
router.post('/', authMiddleware, async (req, res) => {
  const { recipientId, content } = req.body;
  const senderId = req.user.id;

  try {
    const recipient = await User.findById(recipientId);
    if (!recipient) return res.status(404).json({ message: 'Recipient not found' });

    const message = new Message({ sender: senderId, recipient: recipientId, content });
    await message.save();

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: 'Error sending message', error: error.message });
  }
});

// Get conversation with a specific user
router.get('/conversation/:userId', authMiddleware, async (req, res) => {
  const { userId } = req.params;
  const currentUserId = req.user.id;

  try {
    const messages = await Message.find({
      $or: [
        { sender: currentUserId, recipient: userId },
        { sender: userId, recipient: currentUserId },
      ],
    })
      .populate('sender', 'name')
      .populate('recipient', 'name')
      .sort('timestamp');
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching conversation', error: error.message });
  }
});

// Get conversation list (all conversations)
router.get('/conversations', authMiddleware, async (req, res) => {
    const currentUserId = req.user.id;
  
    try {
      const conversations = await Message.aggregate([
        {
          $match: {
            $or: [{ sender: currentUserId }, { recipient: currentUserId }],
          },
        },
        { $sort: { timestamp: -1 } },
        {
          $group: {
            _id: {
              $cond: [
                { $eq: ['$sender', currentUserId] },
                '$recipient',
                '$sender',
              ],
            },
            lastMessage: { $first: '$$ROOT' },
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user',
          },
        },
        { $unwind: '$user' },
        {
          $project: {
            user: { _id: 1, name: 1, email: 1, role: 1 },
            lastMessage: 1,
          },
        },
      ]);
      res.json(conversations);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching conversations', error: error.message });
    }
  });

// New: Get received messages only
router.get('/received', authMiddleware, async (req, res) => {
    const currentUserId = req.user.id;
    try {
      const receivedMessages = await Message.find({ recipient: currentUserId })
        .populate('sender', 'name')
        .sort('-timestamp');
      res.json(receivedMessages);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching received messages', error: error.message });
    }
  });

// Search teachers (for students)
router.get('/search/teachers', authMiddleware, async (req, res) => {
  const { name } = req.query;

  try {
    const teachers = await User.find({
      role: 'teacher',
      name: { $regex: name, $options: 'i' },
    }).select('name email');
    res.json(teachers);
  } catch (error) {
    res.status(500).json({ message: 'Error searching teachers', error: error.message });
  }
});

// Search enrolled students (for teachers)
router.get('/search/my-students', authMiddleware, async (req, res) => {
  const { name } = req.query;
  const teacherId = req.user.id;

  try {
    const teacherClasses = await Class.find({ teacherId }).select('_id');
    const classIds = teacherClasses.map(cls => cls._id);
    const subscriptions = await StudentSubscription.find({ classId: { $in: classIds } }).select('userId');
    const studentIds = subscriptions.map(sub => sub.userId);
    const students = await User.find({
      _id: { $in: studentIds },
      role: 'student',
      name: { $regex: name, $options: 'i' },
    }).select('name email');
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: 'Error searching students', error: error.message });
  }
});

module.exports = router;