//backend/controllers/knowledgebaseController.js
const Knowledgebase = require('../models/Knowledgebase');

// Get all knowledgebase articles (public)
exports.getAllArticles = async (req, res) => {
  try {
    const articles = await Knowledgebase.find().sort({ createdAt: -1 });
    res.status(200).json(articles);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching knowledgebase articles', error: error.message });
  }
};

// Get articles by category (public)
exports.getArticlesByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const articles = await Knowledgebase.find({ category }).sort({ createdAt: -1 });
    res.status(200).json(articles);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching articles by category', error: error.message });
  }
};

// Search articles (public)
exports.searchArticles = async (req, res) => {
  try {
    const { query } = req.query;
    const articles = await Knowledgebase.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { content: { $regex: query, $options: 'i' } },
      ],
    }).sort({ createdAt: -1 });
    res.status(200).json(articles);
  } catch (error) {
    res.status(500).json({ message: 'Error searching articles', error: error.message });
  }
};

// Create new article (admin only)
exports.createArticle = async (req, res) => {
  try {
    const { title, content, category } = req.body;
    if (!title || !content || !category) {
      return res.status(400).json({ message: 'Title, content, and category are required' });
    }

    const article = new Knowledgebase({ title, content, category });
    await article.save();
    res.status(201).json({ message: 'Article created successfully', article });
  } catch (error) {
    res.status(500).json({ message: 'Error creating article', error: error.message });
  }
};

// Update article (admin only)
exports.updateArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, category } = req.body;
    const article = await Knowledgebase.findByIdAndUpdate(
      id,
      { title, content, category, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }
    res.status(200).json({ message: 'Article updated successfully', article });
  } catch (error) {
    res.status(500).json({ message: 'Error updating article', error: error.message });
  }
};

// Delete article (admin only)
exports.deleteArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const article = await Knowledgebase.findByIdAndDelete(id);
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }
    res.status(200).json({ message: 'Article deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting article', error: error.message });
  }
};