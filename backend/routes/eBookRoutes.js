// backend/routes/eBookRoutes.js

const express = require('express');
const router = express.Router();
const eBookController = require('../controllers/eBookController');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'document') {
      cb(null, './src/public/uploads/ebooks/');
    } else if (file.fieldname === 'coverPhoto') {
      cb(null, './src/public/uploads/covers/');
    }
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const filetypes = file.fieldname === 'document' ? /pdf/ : /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(`Error: Only ${file.fieldname === 'document' ? 'PDF' : 'image'} files are allowed!`);
  }
});

router.post('/upload', upload.fields([
  { name: 'document', maxCount: 1 },
  { name: 'coverPhoto', maxCount: 1 }
]), eBookController.uploadEBook);

router.get('/', eBookController.getAllEBooks);
router.get('/download/:id', eBookController.downloadEBook);
router.put('/edit/:id', upload.fields([{ name: 'coverPhoto', maxCount: 1 }]), eBookController.editEBook); // New
router.delete('/delete/:id', eBookController.deleteEBook); // New
module.exports = router;