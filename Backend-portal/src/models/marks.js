const mongoose = require("mongoose");

const divisionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Division name is required"],
    trim: true
  },
  marksObtained: {
    type: Number,
    required: [true, "Marks are required"],
    min: [0, "Marks cannot be negative"]
  },
  maxMarks: {
    type: Number,
    required: [true, "Maximum marks are required"],
    min: [1, "Maximum marks must be at least 1"]
  }
}, { _id: false });

const subjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
    required: true
  },
  divisions: [divisionSchema]
}, { _id: false });

const examSchema = new mongoose.Schema({
  examType: {
    type: String,
    enum: ["Midterm", "Final", "Assignment"],
    required: true
  },
  subjects: {
    type: Map,
    of: subjectSchema
  }
}, { _id: false });

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true
  },
  exams: {
    type: Map,
    of: examSchema
  }
}, { _id: false });

const sectionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  sectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Section",
    required: true
  },
  students: {
    type: Map,
    of: studentSchema
  },
  TeacherName:{
    type:String,
    require:true
  }
}, { _id: false });

const classMarksSchema = new mongoose.Schema({
  className: {
    type: String,
    required: true,
    unique: true
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
    required: true,
    unique: true
  },
  sections: {
    type: Map,
    of: sectionSchema
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp before saving
classMarksSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Indexes for efficient querying
classMarksSchema.index({ className: 1 });
classMarksSchema.index({ classId: 1 });
classMarksSchema.index({ "sections.sectionId": 1 });
classMarksSchema.index({ "sections.students.studentId": 1 });

module.exports = mongoose.model("ClassMarks", classMarksSchema);