require("dotenv").config();
const nodemailer = require("nodemailer");

const Duemailer = async (req, res) => {
  const { parentEmail, studentName, dueAmount } = req.body;

  if (!parentEmail) {
    return res.status(400).json({ message: "Parent email is required." });
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER, // Fetch from .env
      pass: process.env.EMAIL_PASS, // Fetch from .env
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: parentEmail,
    subject: "Urgent: Fee Payment Reminder",
    text: `Dear Parent, 
Your child ${studentName} has an outstanding fee of ₹${dueAmount}. 
Please clear the dues at the earliest.

Regards, 
School Management`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Reminder sent successfully!" });
  } catch (error) {
    console.error("Email error:", error);
    res.status(500).json({ message: "Failed to send email.", error });
  }
};

module.exports = { Duemailer };
