import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "./FeePayments.css";

const FeePayment = () => {
  const location = useLocation();
  const { studentName, studentNumber } = location.state || {};

  const [total_students, setTotalStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);

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

  // Automatically filter and select student based on passed studentNumber or studentName
  useEffect(() => {
    if (studentNumber || studentName) {
      // Check for a match based on studentNumber or studentName
      const student = total_students.find(
        (student) =>
          student.Student_father_number === studentNumber ||
          student.Student_name === studentName
      );
      if (student) {
        setSelectedStudent(student);
        setSearchTerm(student.Student_name); // Set the search term to the selected student's name
      }
    }
  }, [studentNumber, studentName, total_students]);

  const handleStudentClick = (student) => {
    setSelectedStudent(student);
    setFilteredStudents([]);
    setSearchTerm(student.Student_name);
  };

  // Handle the search input change and filter students
  useEffect(() => {
    if (searchTerm.trim().length < 1) {
      setFilteredStudents([]);
    } else {
      const filtered = total_students.filter((student) => {
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
  }, [searchTerm, total_students]);

  return (
    <div className="fee-payment-container">
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

      {searchTerm.trim().length >= 3 && (
        <div className="dropdown">
          {filteredStudents.length > 0 ? (
            <ul className="dropdown-list">
              {filteredStudents.map((student, index) => (
                <li
                  key={student._id || index}
                  className="dropdown-item"
                  onClick={() => handleStudentClick(student)}
                >
                  {student.Student_name || "Unknown"} - {student.Student_father_number || "No Mobile"}
                </li>
              ))}
            </ul>
          ) : !selectedStudent ? (
            <p className="no-results">No students found.</p>
          ) : null}
        </div>
      )}

      {/* Display selected student details */}
      {selectedStudent && (
        <div className="selected-student-container">
          <div className="student-details">
            <h3>Student Details</h3>
            <p><strong>Name:</strong> {selectedStudent.Student_name || "N/A"}</p>
            <p><strong>Father's Name:</strong> {selectedStudent.Student_father_name || "N/A"}</p>
            <p><strong>Mobile Number:</strong> {selectedStudent.Student_father_number || "N/A"}</p>
            <p><strong>Father's Email:</strong> {selectedStudent.Father_email || "N/A"}</p>
            <p><strong>Total Fee:</strong> ₹{selectedStudent.Total_fee || "N/A"}</p>
            <button >pay fee</button>
          </div>
         
        </div>
      )}

  
    </div>
  );
};

export default FeePayment;
