const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  Emp_name: { type: String, required: true },
  Emp_gender: { type: String, required: true },
  Emp_age: { type: Number, required: true },
  Emp_father_name: { type: String, required: true },
  Emp_number: { type: Number, required: true }, // Assuming phone number is a number
  Emp_mail: { type: String, required: false },

  Total_Salary: { type: Number, required: true },
  Emp_id: { type: String, required: true },
  Date_of_admission: { type: Date, default: Date.now },
  Address: { type: String, required: false },
  City: { type: String, required: false },
  State: { type: String, required: false },
  District: { type: String, required: false },
  ZIP_code: { type: String, required: false },
});

const Staff_data = mongoose.model("Staff-data", userSchema);

module.exports = Staff_data;
