const mongoose = require("mongoose");

const feePaymentSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to the Student model
    required: true,
  },
  Registration_number: {
    type: String,
    required: true,
  },
  payments: [
    {
      transactionId: {
        type: String, // Transaction ID for the payment
        required: true,
      },
      paymentDate: {
        type: Date,
        default: Date.now,
      },
      receiptNumber: { type: String, unique: true },
      feeTypes: [
        {
          feeType: {
            type: String, // Fee type (e.g., "Ocean Fee", "Exam Fee")
            required: true,
          },
          amountPaid: {
            type: Number,
            required: true,
          },
          remainingBalance: {
            type: Number, // Remaining balance for this fee type
            required: true,
          },
        },
      ],
    },
  ],
  totalPaid: {
    type: Number,
    default: 0,
  },
});

const FeeData = mongoose.model("FeeData", feePaymentSchema);

module.exports = FeeData;
