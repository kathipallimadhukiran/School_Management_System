const nodemailer = require('nodemailer');
require('dotenv').config();
const User = require('../models/studentdata');
const feepaymentdata = require("../models/feepaymentsdata");

const studentdata = async (req, res) => {
  const {
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
    fees, // Add this to capture the fees data
  } = req.body;

  console.log(req.body); // This will log the entire request body to confirm it's coming correctly

  if (
    !Student_name || !Total_fee || !Number_of_terms || !Fathers_mail || 
    !Student_father_number || !Emergency_contact_number || !Student_age || 
    !ZIP_code || !Date_of_birth || !Student_father_name || !Student_mother_name || 
    !Student_father_number || !Student_gender
  ) {
    return res.status(400).json({ message: "All fields are required!" });
  }

  try {
    // Fetch the latest user entry from the database
    const lastStudent = await User.findOne().sort({ _id: -1 });

    let newRegNumber = "REG001";
    if (lastStudent && lastStudent.Registration_number) {
      const lastRegNum = parseInt(lastStudent.Registration_number.replace("REG", ""), 10);
      newRegNumber = `REG${(lastRegNum + 1).toString().padStart(3, '0')}`;
    }

    // Create the new user including the fees data
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
      fees, // Save the fees data here
    });

    await newUser.save(); // Save the new user along with the fees

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: Fathers_mail,
      subject: `Student Registration Details for ${Student_name}`,
      html: `
        <p>Hello, ${Student_father_name}!</p>

        <p>Here are the details for the student registration:</p>
        <p><b>Registration Number:</b> ${newRegNumber}</p>
        <p><b>Student Name:</b> ${Student_name}</p>
        <p><b>Student Age:</b> ${Student_age}</p>
        <p><b>Student Gender:</b> ${Student_gender}</p>
        <p><b>Grade Applying For:</b> ${Grade_applying_for}</p>
        <p><b>Date of Birth:</b> ${Date_of_birth}</p>
        <p><b>Address:</b> ${Address}</p>
        <p><b>City:</b> ${City}</p>
        <p><b>State:</b> ${State}</p>
        <p><b>District:</b> ${District}</p>
        <p><b>ZIP Code:</b> ${ZIP_code}</p>
        <p><b>Emergency Contact Number:</b> ${Emergency_contact_number}</p>
        <p><b>Father's Name:</b> ${Student_father_name}</p>
        <p><b>Mother's Name:</b> ${Student_mother_name}</p>
        <p><b>Father's Mobile Number:</b> ${Student_father_number}</p>
        <p><b>Mother's Mobile Number:</b> ${Student_mother_number}</p>
        <p><b>Number of Terms:</b> ${Number_of_terms}</p>
        <p><b>Total Fee:</b> ${Total_fee}</p>
        <p><b>Please take a moment to review the details provided above.</b> If any information is incorrect or if you have any questions, kindly <b>contact us at your earliest convenience.</b></p>
        <p>Thank you for choosing our school. We are honored to have you as part of our community and are committed to providing the best educational experience. Should you need assistance, please do not hesitate to reach out.</p>
        <p><b>SFGC Schools,</b><br> Rajahmundry.</p>
        <p>Thank you.</p>
      `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
      } else {
        console.log("Email sent:", info.response);
      }
    });

    res.status(200).json({
      studentName: Student_name,
      regNo: newRegNumber,
      fatherName: Student_father_name,
      fatherPhone: Student_father_number,
      totalFee: Total_fee,
      totalTerms: Number_of_terms,
    });
  } catch (error) {
    console.error("Error saving student data:", error);
    res.status(500).json({ message: "An error occurred." });
  }
};

module.exports = {
  studentdata,
};
