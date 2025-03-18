import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./PaymentPage.module.css"; // Import CSS Module

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

  const [paymentType, setPaymentType] = useState("online");
  const [totalFee, setTotalFee] = useState(0);
  const [totalEnteredAmount, setTotalEnteredAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!studentfeearrey || studentfeearrey.length === 0) return;

    axios
      .get(`https://school-site-2e0d.onrender.com/feepayments/get-fee-data/${studentId}`)
      .then((response) => {
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
  }, [studentId, studentfeearrey]);


  const handleAmountChange = (feeId, value, dueAmount) => {
    let enteredAmount = parseFloat(value) || 0;


    // Prevent entering negative values or values greater than due amount
    if (enteredAmount < 0) {
      enteredAmount = 0;
    } else if (enteredAmount > dueAmount) {
      enteredAmount = dueAmount; // Cap the value at dueAmount
    }

    setCustomAmounts((prev) => {
      const updatedAmounts = { ...prev };
      updatedAmounts[feeId] = {
        ...updatedAmounts[feeId],
        amount: enteredAmount,
      };

      // Recalculate the total entered amount
      const newTotalEntered = Object.values(updatedAmounts).reduce(
        (sum, fee) => sum + (parseFloat(fee.amount) || 0),
        0
      );

      setTotalEnteredAmount(newTotalEntered);
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
        receiptNumber,
      };

      await axios.post("https://school-site-2e0d.onrender.com/feepayments/record-payment", paymentData);

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
          receiptNumber,
          feeDetails: paymentData.FeeTypes,
        },
      });
    } catch (error) {
      console.error("Error recording payment:", error);
      setError("Failed to record payment. Please try again.");
    }
  };

  return (
    <div className={styles.container}>
    
      <h2 className={styles.title}>Fee Payment</h2>

      <div className={styles.studentInfo}>
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

      <table className={styles.feeTable}>
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
            studentfeearrey.map((fee) => {
              const dueAmount = Math.max(fee.FeeAmount - fee.FeePaid, 0); // Ensure non-negative

              return (
                <tr key={fee._id}>
                  <td>{fee.FeeType}</td>
                  <td>₹{fee.FeeAmount}</td>
                  <td>₹{fee.FeePaid}</td>
                  <td>₹{dueAmount}</td>
                  <td>
                    <input
                      type="number"
                      value={customAmounts[fee._id]?.amount ?? ""}
                      onChange={(e) => handleAmountChange(fee._id, e.target.value, fee.FeeAmount - fee.FeePaid)}
                      max={fee.FeeAmount - fee.FeePaid ?? 0} // Prevents exceeding due amount
                      disabled={fee.FeeAmount - fee.FeePaid === 0}
                      className={styles.amountInput}
                    />

                  </td>
                  <td>
                    <input
                      type="checkbox"
                      disabled={dueAmount === 0} // Disable checkbox if no due amount
                      onChange={(e) => {
                        handleAmountChange(fee._id, e.target.checked ? dueAmount : 0, dueAmount);
                      }}
                      className={styles.checkbox}
                    />
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="6">No fee data available</td>
            </tr>
          )}

        </tbody>
      </table>

      <div className={styles.totalAmountSection}>
        <p>
          <strong>Total Amount Entered:</strong> ₹{totalEnteredAmount}
        </p>
      </div>

      <label className={styles.paymentMethod}>
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
        className={styles.payButton}
        onClick={handlePayment}
        disabled={loading || totalEnteredAmount === 0}
      >
        {loading ? "Processing..." : "Pay Now"}
      </button>

      {error && <p className={styles.errorMessage}>{error}</p>}
    </div>
  );
};

export default PaymentPage;