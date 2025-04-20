// backend/routes/knowledgebaseRoutes.js
const express = require('express');
const router = express.Router();
const {
  getAllArticles,
  getArticlesByCategory,
  searchArticles,
  createArticle,
  updateArticle,
  deleteArticle,
} = require('../controllers/knowledgebaseController');
const authMiddleware = require('../middleware/auth');

// Public routes
router.get('/', getAllArticles);
router.get('/category/:category', getArticlesByCategory);
router.get('/search', searchArticles);

// Admin-only routes
router.post('/', authMiddleware, createArticle);
router.put('/:id', authMiddleware, updateArticle);
router.delete('/:id', authMiddleware, deleteArticle);

module.exports = router;