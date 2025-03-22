const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Logindata = require("./loginsdata");

const teacherSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, },
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
});

// ✅ Auto-generate Staff ID before saving
teacherSchema.pre("save", async function (next) {
  if (!this.staffID) {
    this.staffID = `EMP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }
  next();
});

// ✅ Post-save hook to create login details
teacherSchema.post("save", async function (doc, next) {
  try {
    const existingUser = await Logindata.findOne({ email: doc.email });

    if (!existingUser) {
      const hashedPassword = await bcrypt.hash("Staff@123", 10);

      await Logindata.create({
        name: doc.name,
        email: doc.email,
        password: hashedPassword,
        role: "Staff", // Default role for teachers
      });

      console.log("✅ Login details created for:", doc.email);
    } else {
      console.log("⚠️ Login already exists for:", doc.email);
    }
  } catch (error) {
    console.error("❌ Error creating login details:", error);
  }

  next();
});

module.exports = mongoose.model("Teacher", teacherSchema);
