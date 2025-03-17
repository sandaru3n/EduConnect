//backend/controllers/eBookController.js
const EBook = require('../models/eBook');
const path = require('path');
const fs = require('fs');

console.log('EBook model:', EBook ? 'Loaded' : 'Undefined');

exports.uploadEBook = async (req, res) => {
  try {
    const { title, category, author, status } = req.body;
    console.log('Request body:', req.body);
    console.log('Uploaded files:', req.files);

    if (!req.files || !req.files.document) {
      return res.status(400).json({ message: 'Please upload a PDF file' });
    }

    const eBook = new EBook({
      title,
      category,
      author,
      filePath: `/uploads/ebooks/${req.files.document[0].filename}`,
      coverPhotoPath: req.files.coverPhoto ? `/uploads/covers/${req.files.coverPhoto[0].filename}` : null,
      status
    });

    await eBook.save();

    const fileUrl = `http://localhost:5000/uploads/ebooks/${req.files.document[0].filename}`;
    const coverPhotoUrl = eBook.coverPhotoPath ? `http://localhost:5000${eBook.coverPhotoPath}` : null;

    const responseData = {
      message: 'EBook uploaded successfully',
      eBook: eBook.toObject(),
      fileUrl,
      coverPhotoUrl
    };

    console.log('Response data:', responseData);
    res.status(201).json(responseData);
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Error uploading eBook', error: error.message });
  }
};

exports.getAllEBooks = async (req, res) => {
  try {
    const { author, category, uploadDate } = req.query;
    let query = { status: 'active' };

    if (author) query.author = new RegExp(author, 'i');
    if (category) query.category = new RegExp(category, 'i');
    if (uploadDate) query.uploadDate = { $gte: new Date(uploadDate) };

    const eBooks = await EBook.find(query).sort({ uploadDate: -1 });
    const eBooksWithUrls = eBooks.map(book => ({
      ...book.toObject(),
      fileUrl: `http://localhost:5000${book.filePath}`,
      coverPhotoUrl: book.coverPhotoPath ? `http://localhost:5000${book.coverPhotoPath}` : null
    }));
    res.status(200).json(eBooksWithUrls);
  } catch (error) {
    console.error('Fetch error:', error);
    res.status(500).json({ message: 'Error fetching eBooks', error: error.message });
  }
};

exports.downloadEBook = async (req, res) => {
  try {
    const eBook = await EBook.findById(req.params.id);
    if (!eBook || eBook.status !== 'active') {
      return res.status(404).json({ message: 'EBook not found or inactive' });
    }

    eBook.downloadCount += 1;
    await eBook.save();

    const filePath = path.join(__dirname, '../src/public', eBook.filePath);
    console.log('Serving file:', filePath);
    res.download(filePath, `${eBook.title}.pdf`);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ message: 'Error downloading eBook', error: error.message });
  } 
};


exports.editEBook = async (req, res) => {
  try {
    const eBookId = req.params.id;
    const { title, category, author, status } = req.body;
    console.log('Editing eBook with ID:', eBookId, 'Data:', req.body, 'Files:', req.files);

    const eBook = await EBook.findById(eBookId);
    if (!eBook) {
      return res.status(404).json({ message: 'eBook not found' });
    }

    // Update metadata
    eBook.title = title || eBook.title;
    eBook.category = category || eBook.category;
    eBook.author = author || eBook.author;
    eBook.status = status || eBook.status;

    // Handle new cover photo if uploaded
    if (req.files && req.files.coverPhoto) {
      // Delete old cover photo if it exists
      if (eBook.coverPhotoPath && fs.existsSync(path.join(__dirname, 'src/public', eBook.coverPhotoPath))) {
        fs.unlinkSync(path.join(__dirname, 'src/public', eBook.coverPhotoPath));
      }
      eBook.coverPhotoPath = `/uploads/covers/${req.files.coverPhoto[0].filename}`;
    }

    await eBook.save();

    const fileUrl = `http://localhost:5000${eBook.filePath}`;
    const coverPhotoUrl = eBook.coverPhotoPath ? `http://localhost:5000${eBook.coverPhotoPath}` : null;

    const responseData = {
      message: 'eBook updated successfully',
      eBook: eBook.toObject(),
      fileUrl,
      coverPhotoUrl
    };

    console.log('Response data:', responseData);
    res.status(200).json(responseData);
  } catch (error) {
    console.error('Edit error:', error);
    res.status(500).json({ message: 'Error editing eBook', error: error.message });
  }
};

exports.deleteEBook = async (req, res) => {
  try {
    const eBookId = req.params.id;
    console.log('Deleting eBook with ID:', eBookId);

    const eBook = await EBook.findById(eBookId);
    if (!eBook) {
      return res.status(404).json({ message: 'eBook not found' });
    }

    // Delete associated files
    const basePath = path.join(__dirname, 'src/public');
    if (eBook.filePath && fs.existsSync(path.join(basePath, eBook.filePath))) {
      fs.unlinkSync(path.join(basePath, eBook.filePath));
    }
    if (eBook.coverPhotoPath && fs.existsSync(path.join(basePath, eBook.coverPhotoPath))) {
      fs.unlinkSync(path.join(basePath, eBook.coverPhotoPath));
    }

    await EBook.findByIdAndDelete(eBookId);

    res.status(200).json({ message: 'eBook deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: 'Error deleting eBook', error: error.message });
  }
};