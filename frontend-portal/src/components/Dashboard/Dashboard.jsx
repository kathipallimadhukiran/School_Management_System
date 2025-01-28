import React, { useState, useEffect } from "react";
import "./Dashboard.css";

const Dashboard = () => {
  const [total_students, settotal_students] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  const emergencyIntimate = async (mail,studentname) => {
    const subject=window.prompt("what is the complaint ?  ");
    console.log(mail,subject,studentname);
    try {
      const response = await fetch('http://localhost:3000/EmergencyMailSending', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mail ,subject,studentname}),
       
      });
  
      const data = await response.json();
      
      if (response.status === 200) {
        alert(data.message);  // "Emergency email sent successfully"
      } else {
        alert(data.message);  // "User not found" or "Missing Father's email or Student name"
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
      <div className="dashboard">
        <div className="block-row">
          <div className="block total-students">
            <h2>Total Students</h2>
            <p>{total_students.length}</p>
          </div>
          <div className="block total-teachers">
            <h2>Total Teachers</h2>
            <p>totalTeachers</p>
          </div>
        </div>
        <div className="block-row">
          <div className="block unpaid-students">
            <h2>Unpaid Students</h2>
            <p>unpaidStudent</p>
          </div>
          <div className="block total-dues">
            <h2>Total Dues</h2>
            <p>$totalDues</p>
          </div>
        </div>
      </div>
      <div className="student-container">
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
                <th>Emergency<br />Intimate</th>
              </tr>
            </thead>
            <tbody>
              {total_students.map((student, index) => (
                <tr key={student.id}>
                  <td >{index + 1}</td>
                  <td>{student.Student_name}</td>
                  <td>{student.Fathers_mail}</td>
                  <td>{student.Emergency_contact_number}</td>
                  <td>
                    <button className="btn update-btn" onClick={() => updateMarks(student.id)}>
                      Update Marks
                    </button>
                  </td>
                  <td>
                    <button className="btn pay-btn" onClick={() => payFee(student.id)}>
                      Pay Fee
                    </button>
                  </td>
                  <td>
                    <button className="btn complaint-btn" onClick={() => emergencyIntimate(student.Fathers_mail,student.Student_name)}>
                    complaint
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    </div>
  );
};

export default Dashboard;
