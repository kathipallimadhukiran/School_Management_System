const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  code: { type: String, required: true, unique: true }, // Example: MATH101
  teachers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' }] // Teachers assigned to this subject
});

module.exports = mongoose.model('Subject', subjectSchema);
