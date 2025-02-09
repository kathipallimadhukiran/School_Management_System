import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./FeePayments.css";
import Dummypayments from "./dummyfee";

const FeePayment = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [total_students, setTotalStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [enablepay, setEnablepay] = useState(false);

  // Extract student details from location state
  const { studentName, studentNumber } = location.state || {};

  // Function to navigate to payment page
  const handlePayFee = (student) => {
    console.log(student)
    navigate("/feePayments/payments", {
      state: {
        studentFee: student.Total_fee,
        studentRegno: student.Registration_number,
        studentName: student.Student_name,
        studentNumber: student.Student_father_number,
        fatherName: student.Student_father_name,
        
        studentId: student._id,
        studentfeearrey: student.fees,  // <-- Use the expected name
        Amountpaid: student.Total_Fee_Paid
      },
    });
    
  };

  // Fetch student data once when the component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:3000/gettingStudent");
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
      const student = total_students.find(
        (s) =>
          s.Student_father_number === studentNumber ||
          s.Student_name === studentName
      );
      if (student) {
        setSelectedStudent(student);
        setSearchTerm(student.Student_name);
      }
    }
  }, [studentName, studentNumber, total_students]);

  // Handle student selection from dropdown
  const handleStudentClick = (student) => {
    setSelectedStudent(student);
    setFilteredStudents([]);
    setSearchTerm(student.Student_name);
    handlePayFee(student);
  };

  // Filter students based on search input
  useEffect(() => {
    if (searchTerm.trim().length < 1) {
      setFilteredStudents([]);
    } else {
      const filtered = total_students.filter((student) => {
        const nameMatch = student.Student_name?.toLowerCase().includes(
          searchTerm.toLowerCase()
        );
        const mobileMatch = String(
          student.Student_father_number || ""
        ).includes(searchTerm);

        return nameMatch || mobileMatch;
      });

      setFilteredStudents(filtered);
    }
  }, [searchTerm, total_students]);

  return (
    <div className="fee-payment-container" id="payments">
      <h2 className="fee-payment-title">Fees Payment</h2>
      <input
        type="text"
        placeholder="Search by Name or Mobile Number"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="fee-payment-input"
      />

      {loading && <p className="loading-text">Loading...</p>}
      {error && <p className="error-text">{error}</p>}

      {/* Search Results Dropdown */}
      {searchTerm.trim().length >= 3 && (
        <div className="dropdown">
          {filteredStudents.length > 0 ? (
            <ul className="dropdown-list">
              {filteredStudents.map((student) => (
                <li
                  key={student._id}
                  className="dropdown-item"
                  onClick={() => handleStudentClick(student)}
                >
                  {student.Student_name || "Unknown"} -{" "}
                  {student.Student_father_number || "No Mobile"}
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-results">No students found.</p>
          )}
        </div>
      )}

   
    </div>
  );
};

export default FeePayment;
