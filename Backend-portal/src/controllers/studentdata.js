const nodemailer = require('nodemailer');
require('dotenv').config();
const User = require('../models/studentdata'); // Student Model
const Class = require('../models/classes'); // Class Model
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
    fees, // Capture the fees data
  } = req.body;

  console.log(req.body); // Debug: Log request body

  if (
    !Student_name || !Total_fee || !Number_of_terms || !Fathers_mail || 
    !Student_father_number || !Emergency_contact_number || !Student_age || 
    !ZIP_code || !Date_of_birth || !Student_father_name || !Student_mother_name || 
    !Student_father_number || !Student_gender
  ) {
    return res.status(400).json({ message: "All fields are required!" });
  }

  try {
    // 🔍 Check if student already exists (Prevent duplicate registration)
    const existingStudent = await User.findOne({ 
      Student_name, 
      Date_of_birth 
    });

    if (existingStudent) {
      return res.status(400).json({ message: "Student already registered!" });
    }

    // 🔢 Generate Registration Number (Auto-increment)
    const lastStudent = await User.findOne().sort({ _id: -1 });

    let newRegNumber = "REG001";
    if (lastStudent && lastStudent.Registration_number) {
      const lastRegNum = parseInt(lastStudent.Registration_number.replace("REG", ""), 10);
      newRegNumber = `REG${(lastRegNum + 1).toString().padStart(3, '0')}`;
    }

    // 🏫 Find Class based on "Grade_applying_for"
    const matchedClass = await Class.findOne({ name: Grade_applying_for });

    // 👨‍🎓 Create New Student
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
      fees, 
      classId: matchedClass ? matchedClass._id : null, // Auto-assign class if found
    });

    await newUser.save(); // Save Student

    // 📌 If class exists, add student to class
    if (matchedClass) {
      matchedClass.students.push(newUser._id);
      await matchedClass.save();
    }

    // 📩 Send Confirmation Email
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
        <p><b>Grade Applying For:</b> ${Grade_applying_for}</p>
        <p><b>Total Fee:</b> ${Total_fee}</p>
        <p><b>Father's Contact:</b> ${Student_father_number}</p>
        <p>Please review the details above and contact us if any corrections are needed.</p>
        <p><b>SFGC Schools,</b><br> Rajahmundry.</p>
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
      message: "Student registered successfully",
      studentName: Student_name,
      regNo: newRegNumber,
      classAssigned: matchedClass ? matchedClass.name : "No class assigned",
    });
  } catch (error) {
    console.error("Error saving student data:", error);
    res.status(500).json({ message: "An error occurred." });
  }
};

module.exports = { studentdata };
