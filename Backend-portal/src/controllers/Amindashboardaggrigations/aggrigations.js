const User = require("../../models/studentdata");
const Teacher = require("../../models/teacherdata");
const {Class} = require("../../models/classes");


const getTotalDueAmounts = async (req, res) => {
  try {
    const result = await User.aggregate([
      {
        $project: {
          totalDue: { $subtract: ["$Total_fee", "$Total_Fee_Paid"] }
        }
      },
      {
        $group: {
          _id: null,
          totalDueAmount: { $sum: "$totalDue" }
        }
      }
    ]);

    res.status(200).json({ totalDueAmount: result[0].totalDueAmount });
  } catch (error) {
    res.status(500).json({ message: "Error calculating total due amounts", error });
  }
};
const getTeachercount = async (req, res) => {
  try {
    const result = await Teacher.aggregate([
   
      {
        $group: {
          _id: "$name",
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({ result });
  } catch (error) {
    res.status(500).json({ message: "Error calculating teacher count", error });
  }
};
const getClasscount = async (req, res) => {
  try {
    const count = await Class.countDocuments();
    console.log("Total classes:", count);
    res.status(200).json({ totalClasses: count });
  } catch (error) {
    console.error("Error getting class count:", error);
    res.status(500).json({ message: "Error calculating class count", error: error.message });
  }
};





module.exports = { getTotalDueAmounts ,getTeachercount,getClasscount};