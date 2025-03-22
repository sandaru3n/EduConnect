const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const authorizeRole = require("../middleware/roleAuth");
const { getStudyPacks, addStudyPack, editStudyPack, deleteStudyPack } = require("../controllers/studyPackController");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

router
  .route("/")
  .get(authMiddleware, authorizeRole(["Admin", "Teacher"]), getStudyPacks)
  .post(
    authMiddleware,
    authorizeRole(["Admin", "Teacher"]),
    upload.single("file"),
    addStudyPack
  );

router
  .route("/:id")
  .put(
    authMiddleware,
    authorizeRole(["Admin", "Teacher"]),
    upload.single("file"),
    editStudyPack
  )
  .delete(authMiddleware, authorizeRole(["Admin", "Teacher"]), deleteStudyPack);

module.exports = router;