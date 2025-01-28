const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  Student_name: { type: String, required: true },
  Student_gender:{type:String,required:true},
  Student_age: { type: Number, required: true },
  Student_father_name: { type: String, required: true },
  Student_mother_name: { type: String, required: true },
  Student_father_number: { type: Number, required: true },  // Assuming phone number is a number
  Student_mother_number: { type: Number,},
  Fathers_mail: { type: String, required: false },

  Number_of_terms: { type: Number, required: true },
  Total_fee: { type: Number, required: true },
  Registration_number: { type: String, required: true },
  Date_of_admission: { type: Date, default: Date.now },

  Address: { type: String, required: false },
  City: { type: String, required: false },
  State: { type: String, required: false },
  District: { type: String, required: false },
  ZIP_code: { type: String, required: false },
  Emergency_contact_number: { type: String, required: false },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
