const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  imagePath: {
    type: String,
    required: true
  },
  // Add any other fields you need, like a user reference, etc.
});

module.exports = mongoose.model('Image', imageSchema);
