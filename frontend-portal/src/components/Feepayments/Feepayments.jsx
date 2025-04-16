import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "./Feepayments.module.css"; // Import CSS Module

const FeePayment = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [totalStudents, setTotalStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const API_URL = import.meta.env.VITE_API_URL;

  // Extract student details from location state
  const { studentName, studentNumber } = location.state || {};

  // Function to navigate to payment page
  const handlePayFee = (student) => {
    navigate("/feePayments/payments", {
      state: {
        studentFee: student.Total_fee,
        studentRegno: student.Registration_number,
        studentName: student.Student_name,
        studentNumber: student.Student_father_number,
        fatherName: student.Student_father_name,
        studentId: student._id,
        studentfeearrey: student.fees,
        Amountpaid: student.Total_Fee_Paid,
      },
    });
  };

  // Fetch student data once when the component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${API_URL}/gettingStudent`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const result = await response.json();
        setTotalStudents(result.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Automatically select a student based on URL state
  useEffect(() => {
    if (studentName || studentNumber) {
      const student = totalStudents.find(
        (s) =>
          s.Student_father_number === studentNumber ||
          s.Student_name === studentName
      );
      if (student) {
        setSelectedStudent(student);
        setSearchTerm(student.Student_name);
      }
    }
  }, [studentName, studentNumber, totalStudents]);

  // Handle student selection from dropdown
  const handleStudentClick = (student) => {
    setSelectedStudent(student);
    setFilteredStudents([]); // Clear the dropdown list after selecting
    setSearchTerm(student.Student_name); // Set the search term to the student's name
  };

  // Filter students based on search input
  useEffect(() => {
    if (searchTerm.trim().length < 1) {
      setFilteredStudents([]);
    } else {
      const filtered = totalStudents.filter((student) => {
        const nameMatch = student.Student_name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());
        const mobileMatch = String(student.Student_father_number || "").includes(
          searchTerm
        );

        return nameMatch || mobileMatch;
      });

      setFilteredStudents(filtered);
    }
  }, [searchTerm, totalStudents]);

  return (
    <div className={styles.container} id="payments">
   
      <h2 className={styles.title}>Fees Payment</h2>
      <input
        type="text"
        placeholder="Search by Name or Mobile Number"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className={styles.input}
      />

      {loading && <p className={styles.loadingText}>Loading...</p>}
      {error && <p className={styles.errorText}>{error}</p>}

      {/* Search Results Dropdown */}
      {searchTerm.trim().length >= 3 && (
        <div className={styles.dropdown}>
          {filteredStudents.length > 0 ? (
            <ul className={styles.dropdownList}>
              {filteredStudents.map((student) => (
                <li
                  key={student._id}
                  className={styles.dropdownItem}
                  onClick={() => handleStudentClick(student)} // Select student but don't navigate immediately
                >
                  {student.Student_name || "Unknown"} -{" "}
                  {student.Student_father_number || "No Mobile"}
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.noResults}>No students found.</p>
          )}
        </div>
      )}

      {/* Centered Student Details */}
      {selectedStudent && (
        <div className={styles.selectedStudentDetails}>
          <h3>Selected Student</h3>
          <p>Name: {selectedStudent.Student_name}</p>
          <p>Registration Number: {selectedStudent.Registration_number}</p>
          <p>Father's Contact: {selectedStudent.Student_father_number}</p>
          <p>Remaining Fee: ₹{selectedStudent.Total_fee - selectedStudent.Total_Fee_Paid}</p>

          <button
            className={styles.payNowButton}
            onClick={() => handlePayFee(selectedStudent)} // Allow navigation when "Pay Now" is clicked
            disabled={selectedStudent.Total_fee === selectedStudent.Total_Fee_Paid}
          >
            {selectedStudent.Total_fee === selectedStudent.Total_Fee_Paid
              ? "Fee Paid"
              : "Pay Now"}
          </button>
        </div>
      )}

      {/* Instructions at the Bottom */}
      <div className={styles.paymentInfo}>
        <h3>Note:</h3>
        <p>
          Please ensure that the student's details are correct before proceeding
          with the payment. You can search using either the student's name or
          their father's mobile number.
        </p>

        <h3>How to Pay:</h3>
        <p>
          Once you have selected the student, you will be directed to the payment
          page. You can choose to pay the full fee or a partial payment.
        </p>
        <p>
          After the payment is completed, a receipt will be generated, and the
          student's fee status will be updated.
        </p>
      </div>
    </div>
  );
};

export default FeePayment;