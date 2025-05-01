const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const teacherSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  gender: { type: String, required: true },
  dob: { type: Date, required: true },
  address: { type: String, required: true },
  subjectSpecialization: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true }
  ],
  experience: { type: Number, required: true },
  salary: { type: Number },
  joiningDate: { type: Date, required: true },
  role: { type: String, required: true, default: "Teacher" },
  staffID: { type: String, unique: true },
  ClassTeacher: { type: String },
  profileImage: { type: String, default: "" },

  assignedClasses: [
    {
      classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
      sectionId: { type: mongoose.Schema.Types.ObjectId }
    }
  ]
});

teacherSchema.pre("save", async function (next) {
  // Auto-generate staffID if not present
  if (!this.staffID) {
    const randomNumber = Math.floor(1000 + Math.random() * 9000);
    this.staffID = `EMP${randomNumber}`;
  }

  // Automatically calculate experience from joiningDate
  if (this.joiningDate) {
    const now = new Date();
    const join = new Date(this.joiningDate);

    if (join > now) {
      this.experience = 0;
    } else {
      let experience = now.getFullYear() - join.getFullYear();
      const hasNotCompletedYear =
        now.getMonth() < join.getMonth() ||
        (now.getMonth() === join.getMonth() && now.getDate() < join.getDate());

      if (hasNotCompletedYear) {
        experience -= 1;
      }

      this.experience = Math.max(0, experience);
    }
  }

  next();
});

module.exports = mongoose.model("Teacher", teacherSchema);
