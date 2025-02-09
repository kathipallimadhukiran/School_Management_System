import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom"; // Import Link from react-router-dom
import "./Dashboard.css";

import Marquee from "react-fast-marquee";
import { FaArrowAltCircleRight } from "react-icons/fa";
import Statistics from "../reports/Reports";

const Dashboard = () => {
  const [total_students, settotal_students] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const [unpaidStudents, setUnpaidStudents] = useState([]);
  const [totalDues, setTotalDues] = useState(0); 

  const displayedStudents = showAll
    ? total_students
    : total_students.slice(0, 10);

  // Inside your component
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
        "http://localhost:3000/EmergencyMailSending",
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
        alert(data.message); // "Emergency email sent successfully"
      } else {
        alert(data.message); // "User not found" or "Missing Father's email or Student name"
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while sending the email.");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:3000/gettingStudent");
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const result = await response.json();
        settotal_students(result.data);

        const studentsWithDues = result.data.filter(
          (student) => student.Total_fee - student.Total_Fee_Paid !== 0
        );
  
        setUnpaidStudents(studentsWithDues);
        const totalDueAmount = studentsWithDues.reduce(
          (sum, student) => sum + (student.Total_fee - student.Total_Fee_Paid),
          0
        );
  
        setTotalDues(totalDueAmount); 
        console.log(studentsWithDues,totalDues)
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="dashboard-container">
      <div className="Home-container">
        <Marquee className="marquee" speed={50} gradient={false}>
          Today meeting starts at 3:00pm || Parents meeting is held on
          03-02-2025 || This site will be <b>Live</b> on <b>03-02-2025</b>
        </Marquee>

        <div className="content-container">
          <div className="image-container">
            <img
              src="https://res.cloudinary.com/dg5ir1kvd/image/fetch/f_auto,fl_advanced_resize,c_fill,w_720,h_253/https://www.ccu.edu/blogs/cags/uploads/2017/12/special-ed-teacher-with-student.jpg?v=1715282197043"
              alt="School Children"
            />
            <div className="text-overlay">
              Welcome to, <br />
              School Management portal
            </div>
          </div>
        </div>
      </div>
      <div
        className="Reports"
        id="Reports"
      >
        <Statistics />
      </div>
      <div className="dashboard" id="dashboard">
        <div className="block-row">
          <div className="block total-students">
            <div className="block-text">
              <h2>Total Students</h2>
              <p>{total_students.length}</p>
            </div>
            {/* Wrap with Link to navigate */}
            <Link to="/students" className="view-more">
              <p> More</p> <FaArrowAltCircleRight />
            </Link>
          </div>
          <div className="block total-teachers">
            <div className="block-text">
              <h2>Total Teachers</h2>
              <p>totalTeachers</p>
            </div>
            {/* Wrap with Link to navigate */}
            <Link to="/teachers" className="view-more">
              <p> More</p> <FaArrowAltCircleRight />
            </Link>
          </div>
        </div>
        <div className="block-row">
          <div className="block unpaid-students">
            <div className="block-text">
              <h2>Unpaid Students</h2>
              {
                <p>{unpaidStudents.length}</p>
              }
            </div>
            {/* Wrap with Link to navigate */}
            <Link to="/unpaid-students" className="view-more">
              <p> More</p> <FaArrowAltCircleRight />
            </Link>
          </div>
          <div className="block total-dues">
            <div className="block-text">
              <h2>Total Dues</h2>
              <p>₹{totalDues}</p>
            </div>

            <Link to="/dues" className="view-more">
              <p> More</p> <FaArrowAltCircleRight />
            </Link>
          </div>
        </div>
      </div>
      <div className="student-container" id="students">
        <div className="student">
          <h2 className="student-heading">Student Details</h2>
          <div className="table-wrapper">
            <table className="student-table">
              <thead>
                <tr>
                  <th>S.no</th>
                  <th>Student Name</th>
                  <th>Student Email</th>
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
                    <td>{student.Fathers_mail}</td>
                    <td>{student.Emergency_contact_number}</td>
                    <td>
                      <button
                        className="btn update-btn"
                        onClick={() => updateMarks(student.id)}
                      >
                        Update Marks
                      </button>
                    </td>
                    <td>
                      <button
                        className="btn pay-btn"
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
                        className="btn complaint-btn"
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
          </div>

          {/* Show More / Show Less Button */}
          {total_students.length > 10 && (
            <button
              className="btn show-more-btn"
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
