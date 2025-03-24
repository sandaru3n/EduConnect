// backend/controllers/studyPackController.js
const StudyPack = require('../models/StudyPack');
const StudyPackSubscription = require('../models/StudyPackSubscription'); // Add this line
const path = require('path');
const fs = require('fs');

exports.uploadStudyPack = async (req, res) => {
  try {
    const { title, subject, price } = req.body;
    if (!req.files || !req.files.coverPhoto || !req.files.files) {
      return res.status(400).json({ message: 'Cover photo and at least one file are required' });
    }

    const files = req.files.files.map(file => ({
      type: file.mimetype.includes('pdf') ? 'pdf' : file.mimetype.includes('video') ? 'video' : 'url',
      content: `/uploads/studypacks/${file.filename}`,
    }));

    const studyPack = new StudyPack({
      title,
      subject,
      price,
      coverPhotoPath: `/uploads/covers/${req.files.coverPhoto[0].filename}`,
      files,
      teacherId: req.user.id,
    });

    await studyPack.save();
    res.status(201).json({ message: 'Study pack uploaded successfully', studyPack });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Error uploading study pack', error: error.message });
  }
};

exports.getAllStudyPacks = async (req, res) => {
  try {
    const studyPacks = await StudyPack.find({ status: 'active' })
      .populate('teacherId', 'name')
      .sort({ createdAt: -1 });
    const studyPacksWithUrls = studyPacks.map(pack => ({
      ...pack.toObject(),
      coverPhotoUrl: `http://localhost:5000${pack.coverPhotoPath}`,
      fileCount: {
        pdfs: pack.files.filter(f => f.type === 'pdf').length,
        videos: pack.files.filter(f => f.type === 'video').length,
        urls: pack.files.filter(f => f.type === 'url').length,
      },
    }));
    res.status(200).json(studyPacksWithUrls);
  } catch (error) {
    console.error('Fetch error:', error);
    res.status(500).json({ message: 'Error fetching study packs', error: error.message });
  }
};

exports.getPurchasedStudyPacks = async (req, res) => {
  try {
    const subscriptions = await StudyPackSubscription.find({ userId: req.user.id }); // Use new model
    const studyPackIds = subscriptions.map(sub => sub.studyPackId); // Use studyPackId
    const studyPacks = await StudyPack.find({ _id: { $in: studyPackIds }, status: 'active' })
      .populate('teacherId', 'name');
    const studyPacksWithUrls = studyPacks.map(pack => ({
      ...pack.toObject(),
      coverPhotoUrl: `http://localhost:5000${pack.coverPhotoPath}`,
      files: pack.files.map(file => ({
        ...file,
        content: file.type === 'url' ? file.content : `http://localhost:5000${file.content}`,
      })),
    }));
    res.status(200).json(studyPacksWithUrls);
  } catch (error) {
    console.error('Fetch error:', error);
    res.status(500).json({ message: 'Error fetching purchased study packs', error: error.message });
  }
};