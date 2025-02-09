
const mongoose=require("mongoose");
const userSchema = new mongoose.Schema({
  Student_name: { type: String, required: true },
  Student_age: { type: Number, required: true },
  Student_gender: { type: String, required: true },
  Grade_applying_for: { type: String, required: true },
  Date_of_birth: { type: String, required: true },
  Address: { type: String, required: true },
  City: { type: String, required: true },
  State: { type: String, required: true },
  District: { type: String, required: true },
  ZIP_code: { type: String, required: true },
  Emergency_contact_number: { type: String, required: true },
  Student_father_name: { type: String, required: true },
  Student_mother_name: { type: String, required: true },
  Student_father_number: { type: String, required: true },
  Student_mother_number: { type: String, required: true },
  Fathers_mail: { type: String, required: true },
  Total_fee: { type: Number, required: true },
  Total_Fee_Paid: { type: Number, default: 0 },  // New field
  Number_of_terms: { type: Number, required: true },
  Registration_number: { type: String, required: true },
  fees: [{
    FeeType: { type: String, required: true },
    FeeAmount: { type: Number, required: true },
    FeePaid: { type: Number, default: 0 },

  }],
});

const User = mongoose.model("User", userSchema);

module.exports = User;
