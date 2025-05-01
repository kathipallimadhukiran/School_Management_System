const bcrypt = require("bcrypt");
const User = require("../models/loginsdata"); // Adjust to your actual User model
const {Class} = require("../models/classes");
const Student = require("../models/studentdata");
const Teacher =require("../models/teacherdata")
const logindata =require("../models/loginsdata")

const delete_class = async (req, res) => {
  try {
    const { classId } = req.params;

  
    if (!mongoose.Types.ObjectId.isValid(classId)) {
      return res.status(400).json({ message: "Invalid class ID format" });
    }
    console.log("formate done")

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    // Optional: check for admin or specific roles
    if (user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized action" });
    }

    const classData = await Class.findById(classId);
    if (!classData) {
      return res.status(404).json({ message: "Class not found" });
    }

    await Student.updateMany(
      { _id: { $in: classData.students } },
      { $set: { Grade_applying_for: "Unassigned" } }
    );

    await Class.findByIdAndDelete(classId);

    res.status(200).json({ message: "Class deleted successfully" });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


const delete_staff = async (req, res) => {
  try {
    const { TeacherId } = req.params;

    const teacher = await Teacher.findById(TeacherId);
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    await Teacher.findByIdAndDelete(TeacherId);
    await logindata.findOneAndDelete({ email: teacher.email }); // adjust field as needed

    res.status(200).json({ message: "Teacher deleted successfully" });
  } catch (error) {
    console.error("Error deleting teacher:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


module.exports = {

  delete_class,

delete_staff, 
}
