import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const userRole = localStorage.getItem("userRole");

  // Redirect non-admins to Dashboard or Login
  useEffect(() => {
    if (userRole !== "Admin") {
      alert("Access Denied! Admins only.");
      navigate("/Dashboard"); // Redirect non-admins
    }
  }, [userRole, navigate]);

  return (
    <div className="admin-dashboard">
      <h2>Welcome, Admin</h2>
      <p>Manage staff and other administrative tasks here.</p>

      {/* ✅ Add Staff Button (Only for Admin) */}
      <button className="add-staff-btn" onClick={() => navigate("/AddStaff")}>
        Add Staff
      </button>

      {/* You can add more Admin functionalities here */}
    </div>
  );
};

export default AdminDashboard;
