const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const teacherSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Store teacher password here
  phone: { type: String, required: true },
  gender: { type: String, required: true },
  dob: { type: Date, required: true },
  address: { type: String, required: true },
  subjectSpecialization: { type: [String], required: true },
  experience: { type: Number, required: true },
  salary: { type: Number },
  joiningDate: { type: Date, required: true },
  role: { type: String, required: true, default: "Teacher" },
  staffID: { type: String, unique: true }, // Auto-generated staff ID
  ClassTeacher: { type: String }
});

// ✅ Auto-generate Staff ID before saving
teacherSchema.pre("save", async function (next) {
  if (!this.staffID) {
    const randomNumber = Math.floor(1000 + Math.random() * 9000); // Ensures a 4-digit number
    this.staffID = `EMP${randomNumber}`;
  }
  next();
});


module.exports = mongoose.model("Teacher", teacherSchema);
