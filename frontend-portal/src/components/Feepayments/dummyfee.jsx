import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "./dummyfee.css";


const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    studentRegno = "",
    studentFee,
    studentName = "",
    fatherName = "",
    studentId = "",
    Amountpaid = 0,
    studentfeearrey = [], // Default empty array to avoid undefined.map()
  } = location.state || {};


console.log(studentFee);


  const [customAmounts, setCustomAmounts] = useState(() => {
    if (!studentfeearrey) return {};
    return studentfeearrey.reduce((acc, fee) => {
      acc[fee._id] = {
        amount: "",
        isChecked: false,
        remainingFee: fee.FeeAmount,
      };
      return acc;
    }, {});
  });

  const [paymentType, setPaymentType] = useState("offline");
  const [totalFee, setTotalFee] = useState(0);
  const [totalEnteredAmount, setTotalEnteredAmount] = useState(0); // NEW: Tracks total entered amount
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!studentfeearrey || studentfeearrey.length === 0) return;

    axios
      .get(`https://school-site-2e0d.onrender.com/feepayments/get-fee-data/${studentId}`)
      .then((response) => {
        console.log("Fee Data:", response.data);
        const payments = response.data.payments || [];
        const updatedAmounts = {};

        studentfeearrey.forEach((fee) => {
          updatedAmounts[fee._id] = {
            amountPaid: 0,
            remainingFee: fee.FeeAmount,
          };
        });

        payments.forEach((payment) => {
          payment.feeTypes.forEach((fee) => {
            if (updatedAmounts[fee._id]) {
              updatedAmounts[fee._id].amountPaid += fee.amountPaid;
              updatedAmounts[fee._id].remainingFee = fee.remainingBalance;
            }
          });
        });

        setCustomAmounts(updatedAmounts);
        setTotalFee(response.data.totalPaid || 0);
      })
      .catch((err) => console.error("Error fetching fee data:", err));
      console.log(studentfeearrey)
  }, [studentId, studentfeearrey]);

  // Handle amount input change and update the total entered amount
  const handleAmountChange = (feeId, value) => {
    if (isNaN(value) || value < 0) return;

    setCustomAmounts((prev) => {
      const updatedAmounts = { ...prev };
      updatedAmounts[feeId].amount = parseFloat(value) || 0;

      // Calculate total entered amount
      const newTotalEntered = Object.values(updatedAmounts).reduce(
        (sum, fee) => sum + (parseFloat(fee.amount) || 0),
        0
      );

      setTotalEnteredAmount(isNaN(newTotalEntered) ? 0 : newTotalEntered);
      return updatedAmounts;
    });
  };

  const handlePayment = async () => {
    setLoading(true);
    try {
      if (paymentType === "online") {
        const response = await axios.post(
          "https://school-site-2e0d.onrender.com/feepayments/create-order",
          {
            amount: totalEnteredAmount,
            studentId,
          }
        );

        const { orderId } = response.data;
        openRazorpay(orderId);
      } else {
        await recordPayment();
        alert("Offline Payment Recorded Successfully!");
      }
    } catch (error) {
      console.error("Payment error:", error);
      setError("Payment failed. Please try again.");
    }
    setLoading(false);
  };

  const openRazorpay = (orderId) => {
    if (!window.Razorpay) {
      alert("Razorpay SDK failed to load. Check your internet connection.");
      return;
    }

    const options = {
      key: "rzp_test_vOBUusgJThlKav", // Test key
      amount: totalEnteredAmount * 100, // Convert to paise
      currency: "INR",
      name: studentName,
      description: "Fee Payment",
      order_id: orderId,
      handler: async function (response) {
        console.log("Payment Success:", response);
        await recordPayment(response.razorpay_payment_id);
      },
      prefill: {
        name: studentName,
        email: "student@example.com",
        contact: "9876543210", // Replace with dynamic value if needed
      },
      theme: { color: "#F37254" },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();

    razorpay.on("payment.failed", function (response) {
      console.error("Payment failed:", response.error);
      setError("Payment failed. Please try again.");
    });
  };

  const recordPayment = async (paymentId = "offline") => {
    try {
      // Generate a unique receipt number (e.g., using timestamp and student ID)
      const receiptNumber = `REC-${studentId.slice(-4)}-${Date.now()}`;
  
      const paymentData = {
        amountPaid: totalEnteredAmount,
        FeeTypes: studentfeearrey.map((fee) => ({
          feeTypeName: fee.FeeType,
          amountPaid: customAmounts[fee._id]?.amount || 0,
          feeAmount: fee.FeeAmount,
        })),
        studentId,
        paymentMethod: paymentId === "offline" ? "Offline" : "Online",
        transactionId: paymentId !== "offline" ? paymentId : null,
        paymentDate: new Date().toLocaleDateString(),
        receiptNumber, // Add the generated receipt number
      };
  
      // Save payment details to the database
      await axios.post("https://school-site-2e0d.onrender.com/feepayments/record-payment", paymentData);
  
      // Navigate to the receipt page with the new receipt number
      navigate("/feePayments/payments/Receipt", {
        state: {
          studentName,
          fatherName,
          studentRegno,
          studentFee,
          totalPaid: totalEnteredAmount,
          paymentMethod: paymentData.paymentMethod,
          transactionId: paymentData.transactionId,
          paymentDate: paymentData.paymentDate,
          receiptNumber,  // Pass receipt number in state
          feeDetails: paymentData.FeeTypes,
        },
      });
  
    } catch (error) {
      console.error("Error recording payment:", error);
      setError("Failed to record payment. Please try again.");
    }
  };
  
  return (
    <div className="payment-container">
       {/* Back Button */}
       <button className="back-button" onClick={() => navigate(-1)}>
        ← Back
      </button>
      <h2 className="title">Fee Payment</h2>

      <div className="student-info">
        <p>
          <strong>Name:</strong> {studentName}
        </p>
        <p>
          <strong>Reg No:</strong> {studentRegno}
        </p>
        <p>
          <strong>Father Name:</strong> {fatherName}
        </p>
        <p>
          <strong>Total Amount Paid:</strong> {Amountpaid}
        </p>
      </div>

      <table className="fee-table">
        <thead>
          <tr>
            <th>Fee Type</th>
            <th>Total Fee</th>
            <th>Amount Paid</th>
            <th>Due Amount</th>
            <th>Enter Amount</th>
            <th>Copy Remaining</th>
          </tr>
        </thead>
        <tbody>
          {studentfeearrey && studentfeearrey.length > 0 ? (
            studentfeearrey.map((fee) => (
              <tr key={fee._id}>
                <td>{fee.FeeType}</td>
                <td>₹{fee.FeeAmount}</td>
                <td>₹{fee.FeePaid}</td>
                <td>₹{fee.FeeAmount - fee.FeePaid || 0}</td>
                <td>
                  <input
                    type="number"
                    value={customAmounts[fee._id]?.amount ?? ""}
                    onChange={(e) =>
                      handleAmountChange(fee._id, e.target.value)
                    }
                  />
                </td>
                <td>
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) {
                        handleAmountChange(
                          fee._id,
                          customAmounts[fee._id]?.remainingFee ?? fee.FeeAmount
                        );
                      }
                    }}
                  />
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6">No fee data available</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Displaying the Total Entered Amount */}
      <div className="total-amount-section">
        <p>
          <strong>Total Amount Entered:</strong> ₹{totalEnteredAmount}
        </p>
      </div>

      <label className="payment-method">
        Select Payment Method:
        <select
          value={paymentType}
          onChange={(e) => setPaymentType(e.target.value)}
        >
          <option value="offline">Offline</option>
          <option value="online">Online</option>
        </select>
      </label>

      <button
        className="pay-button"
        onClick={handlePayment}
        disabled={loading || totalEnteredAmount === 0}
      >
        {loading ? "Processing..." : "Pay Now"}
      </button>
   

      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default PaymentPage;
