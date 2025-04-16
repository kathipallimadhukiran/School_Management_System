const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["Staff", "Admin", "Teacher"] }, // Include "Teacher" directly if needed
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher" }, // 👈 Add this line
});

module.exports = mongoose.model("Logindata", UserSchema);
