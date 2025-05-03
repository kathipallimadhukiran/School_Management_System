const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const { Class } = require("../models/classes");
const Student = require("../models/studentdata");
const Teacher = require("../models/teacherdata");
const logindata = require("../models/loginsdata");

// Delete a class
const delete_class = async (req, res) => {
  try {
    const { classId } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(classId)) {
      return res.status(400).json({ message: "Invalid class ID format" });
    }

    // Find class
    const classData = await Class.findById(classId);
    if (!classData) {
      return res.status(404).json({ message: "Class not found" });
    }

    // Update students: mark them as unassigned
    await Student.updateMany(
      { _id: { $in: classData.students } },
      { $set: { Grade_applying_for: "Unassigned", classId: null } }
    );

    // Delete the class
    await Class.findByIdAndDelete(classId);

    res.status(200).json({ message: "Class deleted successfully" });
  } catch (error) {
    console.error("Error deleting class:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete a staff (teacher)
const delete_staff = async (req, res) => {
  try {
    const { TeacherId } = req.params;

    // Find teacher
    const teacher = await Teacher.findById(TeacherId);
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    // Delete teacher document
    await Teacher.findByIdAndDelete(TeacherId);

    // Delete associated login data by email
    await logindata.findOneAndDelete({ email: teacher.email });

    res.status(200).json({ message: "Teacher deleted successfully" });
  } catch (error) {
    console.error("Error deleting teacher:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  delete_class,
  delete_staff,
};
