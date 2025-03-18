import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MdPersonAdd, MdSchool, MdPayments, MdClass } from "react-icons/md";
import { FaUsers, FaChalkboardTeacher } from "react-icons/fa";
import stylesadmin from "./admindashboard.module.css";
import Statistics from "../reports/Reports";

const AdminDashboard = () => {
  const [userRole, setUserRole] = useState(null);
  const [totalStudents, setTotalStudents] = useState([]);
  const [totalClasses, setTotalClasses] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const [unpaidStudents, setUnpaidStudents] = useState([]);
  const [totalDues, setTotalDues] = useState(0);
  const [totalDueAmount, setTotalDueAmount] = useState(0);

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
    const subject = window.prompt("What is the complaint?");
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
  const [teacherCount, setTeacherCount] = useState(0);

useEffect(() => {
  const fetchTeacherCount = async () => {
    try {
      const response = await fetch("http://localhost:3000/aggregate/getTeachercount");
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const result = await response.json();
      setTeacherCount(result.result.length); // Assuming `result` contains the array of teachers
    } catch (err) {
      setError(err.message);
    }
  };

  fetchTeacherCount();
}, []);

useEffect(() => {
  const fetchClassCount = async () => {
    try {
      const response = await fetch("http://localhost:3000/aggregate/getClasscount");
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();

      setTotalClasses(data.result[0].totalClasses); // Extract the number correctly
    } catch (err) {
      setError(err.message);
    }
  };

  fetchClassCount();
}, []);


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

  useEffect(() => {
    const fetchTotalDueAmounts = async () => {
      try {
        const response = await fetch("http://localhost:3000/aggregate/totalDueAmounts");
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const result = await response.json();
        setTotalDueAmount(result.totalDueAmount);
      } catch (err) {
        setError(err.message);
      }




    };

    fetchTotalDueAmounts();
  }, []);

  useEffect(() => {
    const storedUserRole = localStorage.getItem("userRole");
    setUserRole(storedUserRole);

    if (storedUserRole !== "Admin") {
      alert("Access Denied! Admins only.");
      navigate("/Dashboard");
    }
  }, [navigate]);

  if (userRole !== "Admin") {
    return null; // Prevent rendering if user is not an Admin
  }

  return (
    <div className={stylesadmin.adminDashboard}>
      <h2>Welcome, Admin</h2>
      <p>Manage staff, students, and administrative tasks here.</p>

      {/* ✅ Admin Summary Cards */}
      <div className={stylesadmin.adminCards}>
        <div className={stylesadmin.card}>
          <FaUsers className={stylesadmin.icon} />
          <h3>Total Students</h3>
          {loading ? <p>Loading...</p> : <p>{totalStudents.length}</p>}
        </div>
        <div className={stylesadmin.card}>
  <FaChalkboardTeacher className={stylesadmin.icon} />
  <h3>Total Staff</h3>
  {loading ? <p>Loading...</p> : <p>{teacherCount}</p>}
</div>

        <div className={stylesadmin.card}>
          <MdClass className={stylesadmin.icon} />
          <h3>Total Classes</h3>
          {loading ? <p>Loading...</p> : <p>{totalClasses}</p>}
        </div>
        <div className={stylesadmin.card}>
          <MdPayments className={stylesadmin.icon} />
          <h3>Fees Collected</h3>
          {loading ? <p>Loading...</p> : <p>₹{totalDueAmount}</p>}
        </div>
      </div>

      {/* ✅ Quick Actions */}
      <div className={stylesadmin.actions}>
        <h3>Quick Actions</h3>
        <div className={stylesadmin.actionButtons}>
          <button onClick={() => navigate("/AdminDashboard/AddStaff")}>
            <MdPersonAdd /> Add Staff
          </button>
          <button onClick={() => navigate("/AdminDashboard/StudentManagement")}>
            <MdSchool /> Manage Students
          </button>
          <button onClick={() => navigate("/AdminDashboard/ClassManagement")}>
            <MdClass /> Manage Classes
          </button>
        </div>
      </div>

      <div className={stylesadmin.reports} id="reports">
        {loading ? <p>Loading Reports...</p> : <Statistics />}
      </div>
      {/* Student List */}
      <div className={stylesadmin.studentContainer} id="students">
        <div className={stylesadmin.student}>
          <h2 className={stylesadmin.studentHeading}>Student Details</h2>
          <div className={stylesadmin.tableWrapper}>
            {loading ? (
              <p className={stylesadmin.loadingText}>Fetching Student Data...</p>
            ) : (
              <table className={stylesadmin.studentTable}>
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
                          className={`${stylesadmin.btn} ${stylesadmin.updateBtn}`}
                          onClick={() => updateMarks(student.id)}
                        >
                          Update Marks
                        </button>
                      </td>
                      <td>
                        <button
                          className={`${stylesadmin.btn} ${stylesadmin.payBtn}`}
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
                          className={`${stylesadmin.btn} ${stylesadmin.complaintBtn}`}
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
              className={`${stylesadmin.btn} ${stylesadmin.showMoreBtn}`}
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

export default AdminDashboard;