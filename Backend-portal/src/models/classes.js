const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  name: { type: String, required: true },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
  subjects: [
    {
      subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }, // Link to Subject model
      teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' } // Assign specific teachers to subjects
    }
  ]
});

module.exports = mongoose.model('Class', classSchema);
