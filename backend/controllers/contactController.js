//backend/controllers/contactController.js
const ContactMessage = require('../models/ContactMessage');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

exports.submitContactMessage = async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Classify message using Gemini API
    const prompt = `
      Classify the following message as "normal", "spam", or "promotion":
      Name: ${name}
      Email: ${email}
      Message: ${message}
      Provide only the classification as a single word.
    `;
    const result = await model.generateContent(prompt);
    const classification = result.response.text().trim().toLowerCase();

    const contactMessage = new ContactMessage({
      name,
      email,
      message,
      classification,
    });

    await contactMessage.save();
    res.status(201).json({ message: 'Message submitted successfully' });
  } catch (error) {
    console.error('Error submitting contact message:', error);
    res.status(500).json({ message: 'Error submitting message', error: error.message });
  }
};

exports.getContactMessages = async (req, res) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    res.status(200).json(messages);
  } catch (error) {
    console.error('Error fetching contact messages:', error);
    res.status(500).json({ message: 'Error fetching messages', error: error.message });
  }
};

exports.deleteContactMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const message = await ContactMessage.findByIdAndDelete(id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    res.status(200).json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Error deleting contact message:', error);
    res.status(500).json({ message: 'Error deleting message', error: error.message });
  }
};