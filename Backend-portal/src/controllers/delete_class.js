const bcrypt = require("bcrypt");
const User = require("../models/loginsdata"); // Adjust to your actual User model
const {Class} = require("../models/classes");
const Student = require("../models/studentdata");

const delete_class = async (req, res) => {
  try {
    console.log("Delete request received:", req.body, req.params);
    
    const { email, password } = req.body;
    const { classId } = req.params;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log("User found:", user);

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    const classData = await Class.findById(classId);
    if (!classData) {
      return res.status(404).json({ message: "Class not found" });
    }

    console.log("Class to delete:", classData);

    await Student.updateMany(
      { _id: { $in: classData.students } },
      { $set: { Grade_applying_for: "Unassigned" } }
    );

    await Class.findByIdAndDelete(classId);
    console.log(`Deleted class: ${classId}`);

    res.status(200).json({ message: "Class deleted successfully" });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


exports.delete_class = delete_class;
