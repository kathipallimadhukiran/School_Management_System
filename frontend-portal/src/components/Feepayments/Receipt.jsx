import React, { useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { IoSchool } from "react-icons/io5";
import styles from "./Receipt.module.css"; // Import CSS Module
const API_URL = import.meta.env.VITE_API_URL;

const Receipt = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    studentName,
    fatherName,
    studentRegno,
    studentFee,
    totalPaid,
    paymentMethod,
    transactionId,
    paymentDate,
    receiptNumber,
    feeDetails,
  } = location.state || {};

  const receiptRef = useRef();

  // Function to print the receipt
  const printReceipt = () => {
    const printContent = receiptRef.current.innerHTML;
    const originalContent = document.body.innerHTML;

    document.body.innerHTML = printContent;
    window.print();

    // Restore original content without reloading
    document.body.innerHTML = originalContent;
    document.title = "Receipt"; // Restore title if changed
    window.location.reload(); // Ensure styles remain intact
  };

  return (
    <div className={styles.container}>
      {/* Receipt Content */}
      <div ref={receiptRef} className={styles.receiptContent}>
        {/* Banner */}
        <div className={styles.banner}>
          <IoSchool size={50} className={styles.logo} />
          <h2>SARASWATHI VIDYA NIKETHAN [E.M]</h2>
          <p>
            LKG to 10TH Class, Phone: +91 8099723998, +91 94908 71064, Satellite
            City, Rajahmundry-533107
          </p>
        </div>

        {/* Student & Payment Details */}
        <div className={styles.receiptDetails}>
          <h3>Payment Receipt</h3>
          <table className={styles.receiptInfoTable}>
            <tbody>
              <tr>
                <td>
                  <strong>Student Name:</strong>
                </td>
                <td>{studentName}</td>
                <td>
                  <strong>Father's Name:</strong>
                </td>
                <td>{fatherName}</td>
              </tr>
              <tr>
                <td>
                  <strong>Registration No:</strong>
                </td>
                <td>{studentRegno}</td>
                <td>
                  <strong>Total Fee:</strong>
                </td>
                <td>₹{studentFee}</td>
              </tr>
              <tr>
                <td>
                  <strong>Total Fee Paid:</strong>
                </td>
                <td>₹{totalPaid}</td>
                <td>
                  <strong>Remaining Balance:</strong>
                </td>
                <td>₹{studentFee - totalPaid}</td>
              </tr>
              <tr>
                <td>
                  <strong>Payment Method:</strong>
                </td>
                <td>{paymentMethod}</td>
                <td>
                  <strong>Transaction ID:</strong>
                </td>
                <td>{receiptNumber || "N/A"}</td>
              </tr>
              <tr>
                <td>
                  <strong>Payment Date:</strong>
                </td>
                <td>{paymentDate || new Date().toLocaleDateString()}</td>
                <td></td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Fee Breakdown Table */}
        <h3>Detailed Fee Breakdown</h3>
        <table className={styles.receiptTable}>
          <thead>
            <tr>
              <th>Fee Type</th>
              <th>Amount Paid</th>
            </tr>
          </thead>
          <tbody>
            {feeDetails?.map((fee, index) => (
              <tr key={index}>
                <td>{fee.feeTypeName}</td>
                <td>₹{fee.amountPaid}</td>
              </tr>
            ))}
            <tr className={styles.totalRow}>
              <td>
                <strong>Total Paid:</strong>
              </td>
              <td>
                <strong>₹{totalPaid}</strong>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Additional Fields */}
        <div className={styles.additionalFields}>
          <h4>Additional Information</h4>
          <p>
            <strong>School Address:</strong> Satellite City, Rajahmundry-533107
          </p>
          <p>
            <strong>Contact:</strong> +91 8099723998, +91 94908 71064
          </p>
          <p>
            <strong>Email:</strong> info@saraswathividyanikethan.com
          </p>
          <p>
            <strong>Website:</strong> www.saraswathividyanikethan.com
          </p>
        </div>
      </div>

      {/* Buttons */}
      <div className={styles.buttonContainer}>
        <button onClick={printReceipt} className={styles.printButton}>
          Print Receipt
        </button>
        <button onClick={() => navigate("/")} className={styles.cancelButton}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default Receipt;
