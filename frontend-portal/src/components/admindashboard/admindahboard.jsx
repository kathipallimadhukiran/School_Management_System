import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MdPersonAdd, MdSchool, MdPayments, MdClass } from "react-icons/md";
import { FaUsers, FaChalkboardTeacher } from "react-icons/fa";
import styles from "./admindashboard.module.css";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState(null);

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
    <div className={styles.adminDashboard}>
      <h2>Welcome, Admin</h2>
      <p>Manage staff, students, and administrative tasks here.</p>

      {/* ✅ Admin Summary Cards */}
      <div className={styles.adminCards}>
        <div className={styles.card}>
          <FaUsers className={styles.icon} />
          <h3>Total Students</h3>
          <p>1200</p>
        </div>
        <div className={styles.card}>
          <FaChalkboardTeacher className={styles.icon} />
          <h3>Total Staff</h3>
          <p>85</p>
        </div>
        <div className={styles.card}>
          <MdClass className={styles.icon} />
          <h3>Total Classes</h3>
          <p>40</p>
        </div>
        <div className={styles.card}>
          <MdPayments className={styles.icon} />
          <h3>Fees Collected</h3>
          <p>$150,000</p>
        </div>
      </div>

      {/* ✅ Quick Actions */}
      <div className={styles.actions}>
        <h3>Quick Actions</h3>
        <div className={styles.actionButtons}>
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
    </div>
  );
};

export default AdminDashboard;
