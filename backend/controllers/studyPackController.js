// backend/controllers/studyPackController.js
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

// New: Get teacher's study packs
exports.getTeacherStudyPacks = async (req, res) => {
  try {
    const studyPacks = await StudyPack.find({ teacherId: req.user.id })
      .sort({ createdAt: -1 });
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
    res.status(500).json({ message: 'Error fetching teacher study packs', error: error.message });
  }
};

// New: Delete a study pack
exports.deleteStudyPack = async (req, res) => {
  try {
    const { id } = req.params;
    const studyPack = await StudyPack.findOne({ _id: id, teacherId: req.user.id });

    if (!studyPack) {
      return res.status(404).json({ message: 'Study pack not found or not owned by you' });
    }

    // Delete associated files
    if (studyPack.coverPhotoPath) {
      fs.unlinkSync(path.join(__dirname, '..', 'src', 'public', studyPack.coverPhotoPath));
    }
    studyPack.files.forEach(file => {
      if (file.type !== 'url' && file.content) {
        fs.unlinkSync(path.join(__dirname, '..', 'src', 'public', file.content));
      }
    });

    await StudyPack.deleteOne({ _id: id });
    res.status(200).json({ message: 'Study pack deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: 'Error deleting study pack', error: error.message });
  }
};

exports.updateStudyPack = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, subject, price, filesData } = req.body;
    let parsedFilesData;

    // Parse filesData if provided, otherwise keep it null
    try {
      parsedFilesData = filesData ? JSON.parse(filesData) : null;
    } catch (parseError) {
      console.error('Error parsing filesData:', parseError);
      return res.status(400).json({ message: 'Invalid filesData format' });
    }

    const studyPack = await StudyPack.findOne({ _id: id, teacherId: req.user.id });
    if (!studyPack) {
      return res.status(404).json({ message: 'Study pack not found or not owned by you' });
    }

    // Update basic fields
    studyPack.title = title || studyPack.title;
    studyPack.subject = subject || studyPack.subject;
    studyPack.price = price || studyPack.price;

    // Update cover photo if provided
    if (req.files && req.files.coverPhoto) {
      if (studyPack.coverPhotoPath) {
        const coverPhotoPath = path.join(__dirname, '..', 'src', 'public', studyPack.coverPhotoPath);
        if (fs.existsSync(coverPhotoPath)) {
          fs.unlinkSync(coverPhotoPath);
        } else {
          console.warn(`Cover photo not found at ${coverPhotoPath}, skipping deletion`);
        }
      }
      studyPack.coverPhotoPath = `/uploads/covers/${req.files.coverPhoto[0].filename}`;
    }

    // Update files only if new filesData is provided
    if (parsedFilesData) {
      // Delete old files (except URLs) if they exist
      studyPack.files.forEach(file => {
        if (file.type !== 'url' && file.content) {
          const filePath = path.join(__dirname, '..', 'src', 'public', file.content);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          } else {
            console.warn(`File not found at ${filePath}, skipping deletion`);
          }
        }
      });

      // Map new files, preserving existing ones if no new file is uploaded
      studyPack.files = parsedFilesData.map((fileData, index) => {
        if (fileData.type === 'url') {
          return {
            lessonName: fileData.lessonName,
            type: 'url',
            content: fileData.content,
          };
        } else {
          const file = req.files.files && Array.isArray(req.files.files) && req.files.files[index] ? req.files.files[index] : null;
          if (!file) {
            // If no new file is uploaded, keep the existing file or mark as invalid
            const existingFile = studyPack.files.find(f => f.lessonName === fileData.lessonName);
            if (existingFile && existingFile.type !== 'url') {
              return existingFile; // Preserve existing file
            }
            return {
              lessonName: fileData.lessonName,
              type: fileData.type,
              content: null, // No new file provided
            };
          }
          return {
            lessonName: fileData.lessonName,
            type: fileData.type,
            content: `/uploads/studypacks/${file.filename}`,
          };
        }
      });
    }

    await studyPack.save();
    res.status(200).json({
      message: 'Study pack updated successfully',
      studyPack: {
        ...studyPack.toObject(),
        coverPhotoUrl: `http://localhost:5000${studyPack.coverPhotoPath}`,
        files: studyPack.files.map(file => ({
          lessonName: file.lessonName,
          type: file.type,
          content: file.type === 'url' ? file.content : `http://localhost:5000${file.content}`,
        })),
      },
    });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ message: 'Error updating study pack', error: error.message });
  }
};


module.exports = exports;