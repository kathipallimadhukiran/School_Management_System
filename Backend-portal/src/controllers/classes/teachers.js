
import Teacher from "../../models/teacherdata.js";


const getAllTeachers = async (req, res) => {
  try {
    const totalClasses = await Teacher.find();
    res.json(totalClasses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
export default getAllTeachers