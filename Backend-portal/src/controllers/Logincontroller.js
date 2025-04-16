const mongoose = require("mongoose");
require("dotenv").config(); // Load environment variables
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const Logindata = require("../models/loginsdata"); // Import User model  const mongoose = require("mongoose");
const Teacher = require("../models/teacherdata");





const Signup = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    let {
      name,
      email,
      role,
      phone,
      gender,
      dob,
      address,
      subjectSpecialization,
      experience,
      salary,
      joiningDate,
      department,
    } = req.body;

    name = name?.trim();
    email = email?.trim().toLowerCase();
    role = role?.trim();

    if (!name || !email || !role) {
      return res.status(400).json({ message: "Missing required fields!" });
    }

    const allowedRoles = ["Staff", "Admin", "Teacher"];
    if (!allowedRoles.includes(role)) {
      return res
        .status(403)
        .json({ message: "Invalid role! Only Staff, Admin, or Teacher can sign up." });
    }

    const existingUser = await Teacher.findOne({ email }).session(session);
    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this email." });
    }

    const defaultPassword = "Password";
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    // ✅ Create Teacher entry
    const newTeacher = new Teacher({
      name,
      email,
      password: hashedPassword,
      phone,
      gender,
      dob,
      address,
      subjectSpecialization,
      experience,
      salary,
      joiningDate,
      department,
      role,
    });

    await newTeacher.save({ session });

    // ✅ Add login details in Logindata, including the teacher's ObjectId
    const newUser = new Logindata({
      name,
      email,
      password: hashedPassword,
      role,
      teacherId: newTeacher._id, // <- 👈 Include reference to Teacher model
    });

    await newUser.save({ session });

    await session.commitTransaction();
    session.endSession();

    sendWelcomeEmail(email, name, role);

    res
      .status(201)
      .json({ message: `Teacher registered successfully with default password "Password"!` });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Signup error:", error);
    res.status(500).json({ message: "Internal server error. Please try again later." });
  }
};






const sendWelcomeEmail = async (email, name, role) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Welcome to Our System",
    html: `
      <h2>Welcome, ${name}!</h2>
      <p>Dear ${name},</p>
      <p>You have been successfully registered as a <strong>${role}</strong> in our system.</p>
      <p>Your default password is: <strong>EM@123</strong> (please change it after login).</p>
      <p>Click the link below to login:</p>
      <a href="http://localhost:5173/login">Login Now</a>
      <br><br>
      <p>Best regards,</p>
      <p>School Management Team</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Welcome email sent successfully to:", email);
  } catch (error) {
    console.error("Error sending welcome email:", error);
  }
};





// ✅ Login Function (Only Staff & Admin)
const Login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await Logindata.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ email: user.email, token, role: user.role, id: user.teacherId,Name:user.name});
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ✅ Forgot Password - Send Reset Email
const ForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await Logindata.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found!" });
    }

    // Generate a secure reset token using JWT
    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    const FRONTEND_URL =  process.env.FRONTEND_URL;
    console.log(FRONTEND_URL)
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // Token valid for 1 hour
    await user.save();

    // Send email with reset link
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // ✅ Secure from .env
        pass: process.env.EMAIL_PASS, // ✅ Secure from .env
      },
    });

    const resetURL = `${FRONTEND_URL}/reset-password?token=${resetToken}`;

    const mailOptions = {
      to: user.email,
      from: process.env.EMAIL_USER,
      subject: "Password Reset Request",
      text: `Click the link below to reset your password:\n\n${resetURL}\n\nIf you did not request this, please ignore this email.`,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Password reset link sent to email!" });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Reset Password - Update Password
const ResetPassword = async (req, res) => {
  console.log("JWT_SECRET:", process.env.JWT_SECRET);

  try {
    const { token, newPassword } = req.body;

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);

    } catch (error) {
      return res.status(400).json({ message: "Invalid or expired token!" });
    }
    console.log("Token received:", token);
    console.log("Decoded token:", decoded);
    
    const user = await Logindata.findById(decoded.id);

    if (!user) {
      return res.status(400).json({ message: "User not found!" });
    }

    // Hash new password and update user record
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Password has been reset successfully!" });
  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Export Functions
module.exports = { Login, Signup, ForgotPassword, ResetPassword };