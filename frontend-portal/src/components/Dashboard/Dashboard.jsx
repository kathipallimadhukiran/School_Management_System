import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Dashboard.module.css"; // Import the CSS module

import Marquee from "react-fast-marquee";
import { FaArrowAltCircleRight } from "react-icons/fa";
import Statistics from "../reports/Reports";

const Dashboard = () => {
  const [totalStudents, setTotalStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const [unpaidStudents, setUnpaidStudents] = useState([]);
  const [totalDues, setTotalDues] = useState(0);

  const displayedStudents = showAll ? totalStudents : totalStudents.slice(0, 10);

  const navigate = useNavigate();

  const handlePayFee = (
    studentName,
    studentNumber,
    studentFee,
    studentRegno,
    fatherName,
    studentId,
    studentfeearrey,
    Amountpaid
  ) => {
    navigate("/feePayments/payments", {
      state: {
        studentFee,
        studentRegno,
        studentName,
        studentNumber,
        fatherName,
        studentId,
        studentfeearrey,
        Amountpaid,
      },
    });
  };

  const emergencyIntimate = async (mail, studentname) => {
    const subject = window.prompt("what is the complaint ?");
    console.log(mail, subject, studentname);
    try {
      const response = await fetch(
        "https://school-site-2e0d.onrender.com/EmergencyMailSending",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ mail, subject, studentname }),
        }
      );

      const data = await response.json();

      if (response.status === 200) {
        alert(data.message);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while sending the email.");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "https://school-site-2e0d.onrender.com/gettingStudent"
        );
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

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.homeContainer}>
        <Marquee className={styles.marquee} speed={50} gradient={false}>
          Today meeting starts at 3:00pm || Parents meeting is held on
          03-02-2025 || This site will be <b>Live</b> on <b>03-02-2025</b>
        </Marquee>

        <div className={styles.contentContainer}>
          <div className={styles.textOverlay}>
            Welcome to, <br />
            School Management Portal
          </div>
        </div>
      </div>

      <div className={styles.reports} id="reports">
        {loading ? <p>Loading Reports...</p> : <Statistics />}
      </div>

      <div className={styles.dashboard} id="dashboard">
        <div className={styles.blockRow}>
          <div className={`${styles.block} ${styles.totalStudents}`}>
            <div className={styles.blockText}>
              <h2>Total Students</h2>
              {loading ? <p>Loading...</p> : <p>{totalStudents.length}</p>}
            </div>
            <Link to="/students" className={styles.viewMore}>
              <p> More</p> <FaArrowAltCircleRight />
            </Link>
          </div>

          <div className={`${styles.block} ${styles.totalTeachers}`}>
            <div className={styles.blockText}>
              <h2>Total classes</h2>
              <p>totalClasses</p>
            </div>
            <Link to="/teachers" className={styles.viewMore}>
              <p> More</p> <FaArrowAltCircleRight />
            </Link>
          </div>
        </div>

        <div className={styles.blockRow}>
          <div className={`${styles.block} ${styles.unpaidStudents}`}>
            <div className={styles.blockText}>
              <h2>Unpaid Students</h2>
              {loading ? <p>Loading...</p> : <p>{unpaidStudents.length}</p>}
            </div>
            <Link to="/students" className={styles.viewMore}>
              <p> More</p> <FaArrowAltCircleRight />
            </Link>
          </div>

          <div className={`${styles.block} ${styles.totalDues}`}>
            <div className={styles.blockText}>
              <h2>Total Dues</h2>
              {loading ? <p>Loading...</p> : <p>₹{totalDues}</p>}
            </div>
            <Link to="/dues" className={styles.viewMore}>
              <p> More</p> <FaArrowAltCircleRight />
            </Link>
          </div>
        </div>
      </div>

      {/* Student List */}
      <div className={styles.studentContainer} id="students">
        <div className={styles.student}>
          <h2 className={styles.studentHeading}>Student Details</h2>
          <div className={styles.tableWrapper}>
            {loading ? (
              <p className={styles.loadingText}>Fetching Student Data...</p>
            ) : (
              <table className={styles.studentTable}>
                <thead>
                  <tr>
                    <th>S.no</th>
                    <th>Student Name</th>
                    <th>Student Phone</th>
                    <th>Update Marks</th>
                    <th>Pay Fee</th>
                    <th>
                      Emergency <br /> Intimate
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {displayedStudents.map((student, index) => (
                    <tr key={`${student.id}-${index}`}>
                      <td>{index + 1}</td>
                      <td>{student.Student_name}</td>
                      <td>{student.Emergency_contact_number}</td>
                      <td>
                        <button
                          className={`${styles.btn} ${styles.updateBtn}`}
                          onClick={() => updateMarks(student.id)}
                        >
                          Update Marks
                        </button>
                      </td>
                      <td>
                        <button
                          className={`${styles.btn} ${styles.payBtn}`}
                          onClick={() =>
                            handlePayFee(
                              student.Student_name,
                              student.Student_father_number,
                              student.Total_fee,
                              student.Registration_number,
                              student.Student_father_name,
                              student._id,
                              student.fees,
                              student.Total_Fee_Paid
                            )
                          }
                        >
                          Pay Fee
                        </button>
                      </td>
                      <td>
                        <button
                          className={`${styles.btn} ${styles.complaintBtn}`}
                          onClick={() =>
                            emergencyIntimate(
                              student.Fathers_mail,
                              student.Student_name
                            )
                          }
                        >
                          Complaint
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Show More / Show Less Button */}
          {!loading && totalStudents.length > 10 && (
            <button
              className={`${styles.btn} ${styles.showMoreBtn}`}
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? "Show Less" : "Show More"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;