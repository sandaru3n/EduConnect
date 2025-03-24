const StudyPack = require('../models/StudyPack');
const StudyPackSubscription = require('../models/StudyPackSubscription');
const path = require('path');
const fs = require('fs');

exports.uploadStudyPack = async (req, res) => {
  try {
    const { title, subject, price, filesData } = req.body; // filesData will be a JSON string
    const parsedFilesData = JSON.parse(filesData); // Parse JSON string to array

    if (!req.files || !req.files.coverPhoto) {
      return res.status(400).json({ message: 'Cover photo is required' });
    }

    const files = parsedFilesData.map((fileData, index) => {
      if (fileData.type === 'url') {
        return {
          lessonName: fileData.lessonName,
          type: 'url',
          content: fileData.content, // URL provided by the teacher
        };
      } else {
        const file = req.files.files && req.files.files[index] ? req.files.files[index] : null;
        if (!file) throw new Error('Mismatch in file count');
        return {
          lessonName: fileData.lessonName,
          type: fileData.type,
          content: `/uploads/studypacks/${file.filename}`,
        };
      }
    });

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
    const subscriptions = await StudyPackSubscription.find({ userId: req.user.id });
    const studyPackIds = subscriptions.map(sub => sub.studyPackId);
    const studyPacks = await StudyPack.find({ _id: { $in: studyPackIds }, status: 'active' })
      .populate('teacherId', 'name');
    const studyPacksWithUrls = studyPacks.map(pack => ({
      ...pack.toObject(),
      coverPhotoUrl: `http://localhost:5000${pack.coverPhotoPath}`,
      files: pack.files.map(file => ({
        lessonName: file.lessonName,
        type: file.type,
        content: file.type === 'url' ? file.content : `http://localhost:5000${file.content}`,
      })),
    }));
    res.status(200).json(studyPacksWithUrls);
  } catch (error) {
    console.error('Fetch error:', error);
    res.status(500).json({ message: 'Error fetching purchased study packs', error: error.message });
  }
};

module.exports = exports;