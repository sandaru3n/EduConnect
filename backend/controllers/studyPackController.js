const StudyPack = require("../models/StudyPack");

const getStudyPacks = async (req, res) => {
  try {
    const studyPacks = await StudyPack.find();
    res.status(200).json(studyPacks);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch study packs", error: error.message });
  }
};

const addStudyPack = async (req, res) => {
  try {
    const { title, description, subject, course, topic } = req.body;
    const file = req.file ? req.file.path : null;

    const requiredFields = ["title", "subject", "course", "topic", "file"];
    const missingFields = requiredFields.filter((field) =>
      field === "file" ? !file : !req.body[field]
    );

    if (missingFields.length > 0) {
      return res
        .status(400)
        .json({ message: `Missing required fields: ${missingFields.join(", ")}` });
    }

    const newStudyPack = new StudyPack({
      title,
      description,
      subject,
      course,
      topic,
      file,
      uploadedBy: req.user.id,
    });

    const savedStudyPack = await newStudyPack.save();
    res.status(201).json({
      message: "Study pack created successfully",
      studyPack: savedStudyPack,
    });
  } catch (error) {
    res.status(500).json({ message: "Error creating study pack", error: error.message });
  }
};

const editStudyPack = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, subject, course, topic } = req.body;
    const file = req.file ? req.file.path : req.body.file;

    const updatedStudyPack = await StudyPack.findByIdAndUpdate(
      id,
      { title, description, subject, course, topic, file },
      { new: true }
    );

    if (!updatedStudyPack) {
      return res.status(404).json({ message: "Study pack not found" });
    }

    res.status(200).json({
      message: "Study pack updated successfully",
      studyPack: updatedStudyPack,
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating study pack", error: error.message });
  }
};

const deleteStudyPack = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedStudyPack = await StudyPack.findByIdAndDelete(id);

    if (!deletedStudyPack) {
      return res.status(404).json({ message: "Study pack not found" });
    }

    res.status(200).json({ message: "Study pack deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting study pack", error: error.message });
  }
};

module.exports = { 
  getStudyPacks, 
  addStudyPack, 
  editStudyPack, 
  deleteStudyPack
};