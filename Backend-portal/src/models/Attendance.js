const mongoose = require('mongoose');

const studentAttendanceSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',  // Make sure this matches the correct model name
    required: true
  },
  status: {
    type: String,
    enum: ['Present', 'Absent', 'Late', 'Excused'],
    required: true
  },
  remarks: {
    type: String,
    default: ''
  }
});

const periodAttendanceSchema = new mongoose.Schema({
  period: {
    type: String,
    required: true
  },
  students: [studentAttendanceSchema]
});

const attendanceSchema = new mongoose.Schema({
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  sectionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  markedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true
  },
  periods: [periodAttendanceSchema]
}, { timestamps: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
