const User = require("../models/firstmodel");

const getStudentData = async (req, res) => {
  try {
    const students = await User.find();

    if (students.length === 0) {
      return res.status(404).json({ message: "No student records found" });
    }

    res.json({
      message: "Students data fetched successfully",
      data: students,
    });
  } catch (error) {
    console.error("Error fetching student data:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


module.exports = { getStudentData };
