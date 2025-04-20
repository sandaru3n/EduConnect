// backend/routes/studyPackRoutes.js
const express = require('express');
const router = express.Router();
const { uploadStudyPack, getAllStudyPacks, getPurchasedStudyPacks,getTeacherStudyPacks, deleteStudyPack,updateStudyPack } = require('../controllers/studyPackController');
const authMiddleware = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'coverPhoto') {
      cb(null, './src/public/uploads/covers/');
    } else {
      cb(null, './src/public/uploads/studypacks/');
    }
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

router.post(
  '/upload',
  authMiddleware,
  upload.fields([{ name: 'coverPhoto', maxCount: 1 }, { name: 'files', maxCount: 10 }]),
  uploadStudyPack
);
router.get('/', getAllStudyPacks);
router.get('/purchased', authMiddleware, getPurchasedStudyPacks);
router.get('/teacher', authMiddleware, getTeacherStudyPacks); // New: Teacher's study packs
router.delete('/:id', authMiddleware, deleteStudyPack); // New: Delete study pack
router.put(
  '/:id',
  authMiddleware,
  upload.fields([{ name: 'coverPhoto', maxCount: 1 }, { name: 'files', maxCount: 10 }]),
  updateStudyPack
);

module.exports = router;