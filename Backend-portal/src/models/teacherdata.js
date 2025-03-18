const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  gender: { type: String, required: true },
  dob: { type: Date, required: true },
  address: { type: String, required: true },
  nationality: { type: String, required: true },
  subjectSpecialization: { type: [String], required: true },
  employmentType: { type: String, required: true },
  experience: { type: Number, required: true },
  salary: { type: Number },
  joiningDate: { type: Date, required: true },
  role: { type: String, required: true, default: "Teacher" },
  staffID: { type: String, unique: true }, // Auto-generated staff ID
});

// ✅ Auto-generate Staff ID before saving
teacherSchema.pre("save", async function (next) {
  if (!this.staffID) {
    this.staffID = `TEACH-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }
  next();
});

module.exports = mongoose.model("Teacher", teacherSchema);
