//backend/controllers/faqController.js
const FAQ = require('../models/FAQ');

// Get all FAQs
exports.getAllFAQs = async (req, res) => {
  try {
    const faqs = await FAQ.find().sort({ createdAt: -1 });
    res.status(200).json(faqs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching FAQs', error: error.message });
  }
};

// Create new FAQ
exports.createFAQ = async (req, res) => {
  try {
    const { question, answer } = req.body;
    if (!question || !answer) {
      return res.status(400).json({ message: 'Question and answer are required' });
    }

    const faq = new FAQ({ question, answer });
    await faq.save();
    res.status(201).json({ message: 'FAQ created successfully', faq });
  } catch (error) {
    res.status(500).json({ message: 'Error creating FAQ', error: error.message });
  }
};

// Update FAQ
exports.updateFAQ = async (req, res) => {
  try {
    const { id } = req.params;
    const { question, answer } = req.body;
    const faq = await FAQ.findByIdAndUpdate(
      id,
      { question, answer, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    if (!faq) {
      return res.status(404).json({ message: 'FAQ not found' });
    }
    res.status(200).json({ message: 'FAQ updated successfully', faq });
  } catch (error) {
    res.status(500).json({ message: 'Error updating FAQ', error: error.message });
  }
};

// Delete FAQ
exports.deleteFAQ = async (req, res) => {
  try {
    const { id } = req.params;
    const faq = await FAQ.findByIdAndDelete(id);
    if (!faq) {
      return res.status(404).json({ message: 'FAQ not found' });
    }
    res.status(200).json({ message: 'FAQ deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting FAQ', error: error.message });
  }
};