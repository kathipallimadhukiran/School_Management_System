const mongoose = require("mongoose");

// Counter schema to track the last classID
const counterSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  value: { type: Number, default: 1000 },
});

const Counter = mongoose.model("Counter", counterSchema);

// Section Subdocument Schema
const sectionSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., "A", "B"
  gradeLevel: { type: Number, required: true }, // Now grade level per section
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher" },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }],
  subjects: [
    {
      subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Subject" },
      teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher" },
    },
  ],
});

// Main Class Schema
const classSchema = new mongoose.Schema({
  classID: { type: String, unique: true },
  name: { type: String, required: true }, // e.g., "Class 5"
  sections: [sectionSchema],
});
  
// Auto-generate Class ID before saving
classSchema.pre("save", async function (next) {
  if (!this.classID) {
    try {
      let counter = await Counter.findOneAndUpdate(
        { name: "classID" },
        { $inc: { value: 1 } },
        { new: true, upsert: true }
      );

      this.classID = `CLS-${counter.value}`;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

const Class = mongoose.model("Class", classSchema);

module.exports = { Class, Counter };
