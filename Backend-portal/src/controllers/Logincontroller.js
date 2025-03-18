require("dotenv").config(); // Load environment variables
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const Logindata = require("../models/loginsdata"); // Import User model

// ✅ Signup Function (Only Staff & Admin)
const mongoose = require("mongoose");
const Teacher = require("../models/teacherdata");

const Signup = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    let { name, email, password, role, phone, gender, dob, address, nationality, 
          subjectSpecialization, employmentType, experience, salary, joiningDate, department } = req.body;

    // Trim and normalize inputs
    name = name?.trim();
    email = email?.trim().toLowerCase();
    password = password?.trim();
    role = role?.trim();

    // Validate required fields
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "Missing required fields!" });
    }

    // Ensure role is valid
    const allowedRoles = ["Staff", "Admin", "Teacher"];
    if (!allowedRoles.includes(role)) {
      return res.status(403).json({ message: "Invalid role! Only Staff, Admin, or Teacher can sign up." });
    }

    // Check if user already exists
    const existingUser = await Logindata.findOne({ email }).session(session);
    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this email." });
    }

    // Hash password before storing
    const hashedPassword = await bcrypt.hash(password, 10);

    // Register Teacher with additional details
    if (role === "Teacher") {
      if (!phone || !gender || !dob || !address || !nationality || !subjectSpecialization || 
          !employmentType || !experience || !salary || !joiningDate || !department) {
        return res.status(400).json({ message: "All teacher fields are required!" });
      }

      const newTeacher = new Teacher({
        name,
        email,
        password: hashedPassword,
        phone,
        gender,
        dob,
        address,
        nationality,
        subjectSpecialization,
        employmentType,
        experience,
        salary,
        joiningDate,
        department,
        role: "Teacher",
      });

      await newTeacher.save({ session });
    } else {
      // Register Admin or Staff
      const newUser = new Logindata({ name, email, password: hashedPassword, role });
      await newUser.save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ message: `${role} registered successfully!` });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Signup error:", error);
    res.status(500).json({ message: "Internal server error. Please try again later." });
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

    res.json({ token, role: user.role });
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

    const resetURL = `http://localhost:5173/reset-password?token=${resetToken}`;

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
  try {
    const { token, newPassword } = req.body;

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(400).json({ message: "Invalid or expired token!" });
    }

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