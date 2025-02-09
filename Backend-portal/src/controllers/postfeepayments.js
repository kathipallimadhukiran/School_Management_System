const Razorpay = require("razorpay");
const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const User = require("../models/studentdata"); // Import Student model
const FeeData = require("../models/feepaymentsdata"); // Import FeeData model

const razorpay = new Razorpay({
  key_id: process.env.REACT_APP_RAZORPAY_KEY || "your_test_key_id",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "your_test_key_secret",
});


// Helper function to validate ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const axios = require("axios");

const createOrder = async (req, res) => {
  try {
    const { amount, studentId } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const receipt = `receipt_${studentId}_${Date.now()}`.slice(0, 40);

    const options = {
      amount: amount * 100, // Convert INR to paise
      currency: "INR",
      receipt: receipt,
      payment_capture: 1,
    };

    // ✅ Send API request with Basic Auth
    const response = await axios.post("https://api.razorpay.com/v1/orders", options, {
      auth: {
        username: process.env.RAZORPAY_KEY_ID,   // ✅ Correct authentication
        password: process.env.RAZORPAY_KEY_SECRET,
      },
    });

    res.status(200).json({ orderId: response.data.id });
  } catch (error) {
    console.error("Error creating Razorpay order:", error.response?.data || error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};



const { v4: uuidv4 } = require("uuid");

const recordPayment = async (req, res) => {
  try {
    const { amountPaid, FeeTypes, studentId, paymentMethod } = req.body;

    if (!amountPaid || !FeeTypes || !studentId || !paymentMethod) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }

    let feeData = await FeeData.findOne({ studentId });

    // 🔹 Generate a unique receipt number
    const receiptNumber = `REC-${studentId.slice(-4)}-${Date.now()}`;

    // 🔹 Generate a transaction ID
    const transactionId = uuidv4();

    const newPayment = {
      transactionId,
      receiptNumber,  // 🔹 Store receipt number
      paymentDate: new Date(),
      paymentMethod,
      feeTypes: FeeTypes.map((feeType) => ({
        feeType: feeType.feeTypeName,
        amountPaid: feeType.amountPaid,
        remainingBalance: feeType.feeAmount - feeType.amountPaid,
      })),
    };

    if (!feeData) {
      feeData = new FeeData({
        studentId,
        Registration_number: generateRegistrationNumber(student),
        payments: [newPayment],
        totalPaid: amountPaid,
      });
    } else {
      feeData.payments.push(newPayment);
      feeData.totalPaid += amountPaid;
    }

    await feeData.save();

    FeeTypes.forEach(({ feeTypeName, amountPaid }) => {
      const fee = student.fees.find((f) => f.FeeType === feeTypeName);
      if (fee) {
        fee.FeePaid += amountPaid;
      }
    });

    student.Total_Fee_Paid += amountPaid;
    await student.save();

    res.status(200).json({
      message: "Payment recorded successfully",
      receiptNumber,  // 🔹 Send receipt number in response
      feeData,
      studentFees: student.fees,
      remainingBalance: student.Total_fee - student.Total_Fee_Paid,
    });
  } catch (error) {
    console.error("Error recording payment:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Function to generate a dynamic registration number
const generateRegistrationNumber = (student) => {
  // Customize this logic as per your needs
  return `REG-${student._id.toString().slice(-6)}`; // Example: Use last 6 characters of the studentId as registration number
};

// Export the functions
exports.createOrder = createOrder;
exports.recordPayment = recordPayment;
