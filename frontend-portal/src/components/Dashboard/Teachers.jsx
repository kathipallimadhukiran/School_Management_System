import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Teacher.module.css"; // Import CSS Module

const Teacher = () => {
  const navigate = useNavigate();

  const [totalStudents, setTotalStudents] = useState([]);
  const [unpaidStudents, setUnpaidStudents] = useState([]);
  const [totalDues, setTotalDues] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  const [minRemainingFee, setMinRemainingFee] = useState("");
  const [showSortOptions, setShowSortOptions] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch("https://school-site-2e0d.onrender.com/gettingStudent");
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const result = await response.json();
        setTotalStudents(result.data);

        const studentsWithDues = result.data.filter(
          (student) => student.Total_fee - student.Total_Fee_Paid !== 0
        );
        setUnpaidStudents(studentsWithDues);

        const totalDueAmount = studentsWithDues.reduce(
          (sum, student) => sum + (student.Total_fee - student.Total_Fee_Paid),
          0
        );

        setTotalDues(totalDueAmount);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter and sort students
  let filteredStudents = totalStudents.filter((student) =>
    [student.Student_name, student.Student_father_number, student.Student_father_name]
      .some((field) => field?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (minRemainingFee !== "") {
    filteredStudents = filteredStudents.filter(
      (student) => student.Total_fee - student.Total_Fee_Paid >= Number(minRemainingFee)
    );
  }

  if (sortOrder === "asc") {
    filteredStudents.sort(
      (a, b) =>
        (a.Total_fee - a.Total_Fee_Paid) - (b.Total_fee - b.Total_Fee_Paid)
    );
  } else if (sortOrder === "desc") {
    filteredStudents.sort(
      (a, b) =>
        (b.Total_fee - b.Total_Fee_Paid) - (a.Total_fee - a.Total_Fee_Paid)
    );
  }

  // Send email reminder
  const sendEmailReminder = async (parentEmail, studentName, dueAmount) => {
    if (!parentEmail) {
      alert("No parent email available for this student.");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/sendDueReminder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ parentEmail, studentName, dueAmount }),
      });

      const data = await response.json();

      if (response.status === 200) {
        alert(`Email sent successfully to ${parentEmail}`);
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Error sending email:", error);
      alert("An error occurred while sending the email.");
    }
  };

  return (
    <div className={styles.teacherContainer}>
      <button className={styles.backButton} onClick={() => navigate(-1)}>
        ← Back
      </button>

      {/* Overview Section */}
      <div className={styles.overviewData}>
        <h2>Teacher Overview</h2>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className={styles.errorMessage}>Error: {error}</p>
        ) : (
          <div className={styles.stats}>
            <p>Total Students: {totalStudents.length}</p>
            <p>Unpaid Students: {unpaidStudents.length}</p>
            <p>Total Dues: ₹{totalDues}</p>
          </div>
        )}
      </div>

      {/* Search and Filter Section */}
      <div className={styles.searchContainer}>
        <input
          type="text"
          placeholder="Search by Name, Mobile, or Father's Name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles.searchInput}
        />
        <input
          type="number"
          placeholder="Min Remaining Fee ₹"
          value={minRemainingFee}
          onChange={(e) => setMinRemainingFee(e.target.value)}
          className={styles.searchInput}
        />
        <select
          className={styles.sortDropdown}
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
        >
          <option value="">Sort by Remaining Fee</option>
          <option value="asc">Lowest to Highest</option>
          <option value="desc">Highest to Lowest</option>
        </select>
      </div>

      {/* Student List Section */}
      <div className={styles.studentsList}>
        <h2>Student List</h2>
        {loading ? (
          <p>Loading students...</p>
        ) : (
          <>
            {filteredStudents.length === 0 ? (
              <p>No students found.</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Reg No</th>
                    <th>Name</th>
                    <th>Father's Name</th>
                    <th>Mobile Number</th>
                    <th>Fee Paid</th>
                    <th>Remaining Due</th>
                    <th>Send Reminder</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student, index) => (
                    <tr key={index}>
                      <td>{student.Registration_number}</td>
                      <td>{student.Student_name}</td>
                      <td>{student.Student_father_name}</td>
                      <td>{student.Student_father_number}</td>
                      <td>₹{student.Total_Fee_Paid}</td>
                      <td>₹{student.Total_fee - student.Total_Fee_Paid}</td>
                      <td>
                        <button
                          className={styles.emailButton}
                          onClick={() =>
                            sendEmailReminder(
                              student.Fathers_mail,
                              student.Student_name,
                              student.Total_fee - student.Total_Fee_Paid
                            )
                          }
                        >
                          Send Reminder
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Teacher;