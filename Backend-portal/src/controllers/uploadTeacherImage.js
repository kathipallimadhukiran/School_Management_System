// controllers/teacherController.js
const Teacher = require("../models/teacherdata");

const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const imageUrl = `/uploads/${req.file.filename}`; // This will be the path to the uploaded image

    // Update teacher profile with image URL
    const updatedTeacher = await Teacher.findByIdAndUpdate(
      req.params.id,
      { profileImage: imageUrl },
      { new: true }
    );

    res.json({
      success: true,
      imageUrl: imageUrl,
      teacher: updatedTeacher
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      error: 'Failed to upload image',
      details: error.message
    });
  }
};

module.exports = { uploadImage };
