import React, { useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Receipt.css";
import { IoSchool } from "react-icons/io5";

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
    feeDetails 
  } = location.state || {};
 

  // Reference to print only the receipt section
  const receiptRef = useRef();

  // Function to print only the receipt
  const printReceipt = () => {
    const printContent = receiptRef.current.innerHTML;
    const originalContent = document.body.innerHTML;

    document.body.innerHTML = printContent;
    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload();
  };

  return (
    <div className="receipt-container">
      {/* Receipt Content for Printing */}
      <div ref={receiptRef}  className="receipt-content">

        <div className="banner">
        <IoSchool  size={50} className="logo"/>
        <h2>SARASWATHI VIDYA NIKETHAN [E.M]</h2>
        <p>LKG to 10TH Class , Phone : +91 8099723998 ,+91 94908 71064  ,Satellite city ,Rajahmundry-533107 </p>
        </div>
       

        {/* Student & Payment Details in Two Columns */}
        <div className="receipt-details">
        <h3>Payment Receipt</h3>
          <table className="receipt-info-table">
            <tbody>
              <tr>
                <td><strong>Student Name:</strong></td>
                <td>{studentName}</td>
                <td><strong>Father's Name:</strong></td>
                <td>{fatherName}</td>
              </tr>
              <tr>
                <td><strong>Registration No:</strong></td>
                <td>{studentRegno}</td>
                <td><strong>Total Fee:</strong></td>
                <td>₹{studentFee}</td>
              </tr>
              <tr>
                <td><strong>Total Paid:</strong></td>
                <td>₹{totalPaid}</td>
                <td><strong>Remaining Balance:</strong></td>
                <td>₹{studentFee - totalPaid}</td>
              </tr>
              <tr>
                <td><strong>Payment Method:</strong></td>
                <td>{paymentMethod}</td>
                <td><strong>Transaction ID:</strong></td>
                <td>{receiptNumber || "N/A"}</td>
              </tr>
              <tr>
                <td><strong>Payment Date:</strong></td>
                <td>{paymentDate || new Date().toLocaleDateString()}</td>
                <td></td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Fee Breakdown Table */}
        <h3>Detailed Fee Breakdown</h3>
        <table className="receipt-table">
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
          </tbody>
        </table>
      </div>

      {/* Buttons for Print & Cancel */}
      <div className="button-container">
        <button onClick={printReceipt} className="print-button">Print Receipt</button>
        <button onClick={() => navigate(-1)} className="cancel-button">Cancel</button>
      </div>
    </div>
  );
};

export default Receipt;
