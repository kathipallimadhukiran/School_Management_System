require("dotenv").config(); // Load environment variables
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const Logindata = require("../models/loginsdata"); // Import User model

// ✅ Signup Function (Only Staff & Admin)
const Signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (role !== "Staff" && role !== "Admin") {
      return res.status(403).json({ message: "Only Staff and Admin can sign up!" });
    }

    const existingUser = await Logindata.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new Logindata({ name, email, password: hashedPassword, role });

    await newUser.save();

    res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Server error" });
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