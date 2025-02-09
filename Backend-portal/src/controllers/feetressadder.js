require('dotenv').config();
const User = require('../models/studentdata');
const feetreedata =require("../models/feetreedata")

const studentdata = async (req, res) => {
  const {
    _id,
    branches:[
        {
            branchname:branchname,
            branchfee:branchfee,
        }
    ],
    Number_of_terms,
  } = req.body;

//   if (
   
//   ) {
//     return res.status(400).json({ message: "All fields are required!" });
//   }

  try {
    // Fetch the latest user entry from the database
    const lastStudent = await User.findOne().sort({ _id: -1 });

    let newRegNumber = "REG001";
    if (lastStudent && lastStudent.Registration_number) {
      const lastRegNum = parseInt(lastStudent.Registration_number.replace("REG", ""), 10);
      newRegNumber = `REG${(lastRegNum + 1).toString().padStart(3, '0')}`;
    }

    const newUser = new User({
      Student_name,
      Student_age,
      Student_gender,
      Grade_applying_for,
      Date_of_birth,
      Address,
      City,
      State,
      District,
      ZIP_code,
      Emergency_contact_number,
      Student_father_name,
      Student_mother_name,
      Student_father_number,
      Student_mother_number,
      Fathers_mail,
      Total_fee,
      Number_of_terms,
      Registration_number: newRegNumber,
    });

    await newUser.save();

   
  } catch (error) {
    console.error("Error saving student data:", error);
    res.status(500).json({ message: "An error occurred." });
  }
};

module.exports = {
  studentdata,
};
