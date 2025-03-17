//backend/controllers/pageController.js
const Page = require("../models/Page");

// Fetch a page by slug (Public API)
const getPage = async (req, res) => {
  try {
    const page = await Page.findOne({ slug: req.params.slug });
    if (!page) return res.status(404).json({ message: "Page not found" });
    res.json(page);
  } catch (error) {
    res.status(500).json({ message: "Error fetching page", error });
  }
};

// Admin: Update a page
const updatePage = async (req, res) => {
  try {
    const { title, content } = req.body;
    const page = await Page.findOneAndUpdate(
      { slug: req.params.slug },
      { title, content, lastUpdated: Date.now() },
      { new: true }
    );

    if (!page) return res.status(404).json({ message: "Page not found" });
    res.json({ message: "Page updated successfully", page });
  } catch (error) {
    res.status(500).json({ message: "Error updating page", error });
  }
};

module.exports = { getPage, updatePage };
