const FeeData = require("../../models/feepaymentsdata");

// Controller to get fee payment data by student ID
const getFeeData = async (req, res) => {
  try {
    const { studentId } = req.params;

    // Fetch fee data for the student
    const feeData = await FeeData.findOne({ studentId }).populate('studentId', 'studentName');

    if (!feeData) {
      return res.status(404).json({ message: "No fee data found for the student" });
    }

    // Return the fee data
    res.json(feeData);
  } catch (error) {
    console.error("Error fetching fee data:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = { getFeeData };
