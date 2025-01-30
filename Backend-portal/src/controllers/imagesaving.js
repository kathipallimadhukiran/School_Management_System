const multer = require('multer');
const path = require('path');
const Image = require('../models/imgmodels');

// Set up multer for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');  // Folder to save uploaded images
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));  // Use timestamp to avoid duplicate names
  }
});

const upload = multer({ storage: storage });

// Upload image and save its path in the database
const uploadImage = (req, res) => {
  upload.single('image')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: 'Error uploading image', error: err });
    }

    try {
      const imagePath = req.file.path;  // Path to the uploaded image

      // Save the path in the database
      const newImage = new Image({
        imagePath: imagePath
      });

      await newImage.save();
      res.status(200).json({ message: 'Image uploaded successfully', imagePath });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
};

module.exports = { uploadImage };
