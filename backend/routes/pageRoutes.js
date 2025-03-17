// backend/routes/pageRoutes.js

const express = require("express");
const Page = require("../models/Page");
const router = express.Router();

// Get all pages
router.get("/", async (req, res) => {
    try {
      const pages = await Page.find();
      res.json(pages);
    } catch (error) {
      res.status(500).json({ message: "Error fetching pages", error });
    }
  });

// Get a single page by slug
router.get("/:slug", async (req, res) => {
  try {
    const page = await Page.findOne({ slug: req.params.slug });
    if (!page) return res.status(404).json({ message: "Page not found" });
    res.json(page);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a page
router.put("/:slug", async (req, res) => {
  try {
    const updatedPage = await Page.findOneAndUpdate(
      { slug: req.params.slug },
      { title: req.body.title, content: req.body.content },
      { new: true }
    );
    res.json(updatedPage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;



