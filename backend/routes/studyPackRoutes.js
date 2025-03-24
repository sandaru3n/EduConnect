// backend/routes/studyPackRoutes.js
const express = require('express');
const router = express.Router();
const { uploadStudyPack, getAllStudyPacks, getPurchasedStudyPacks } = require('../controllers/studyPackController');
const authMiddleware = require('../middleware/auth');
const multer = require('multer');
const path = require('path'); // Import the path module

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

module.exports = router;