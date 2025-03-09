import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./addStaff.module.css"; // Import CSS Module

const AddStaff = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const API_URL = "https://school-site-2e0d.onrender.com";

  // ✅ Handle Staff Signup
  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!name || !email || !password) {
      setError("Please enter all fields.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/Signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role: "Staff" }), // ✅ Staff Role Only
      });

      const result = await response.json();

      if (response.ok) {
        setMessage("Staff added successfully!");
      } else {
        setError(result.message || "Signup failed!");
      }
    } catch (err) {
      setError("Server error. Please try again.");
    }
  };

  return (
    <div className={styles.addStaffContainer}>
      <h2>Add New Staff</h2>
      <form onSubmit={handleSignup}>
        <div className={styles.inputGroup}>
          <label>Name</label>
          <input
            type="text"
            placeholder="Enter staff name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className={styles.inputGroup}>
          <label>Email</label>
          <input
            type="email"
            placeholder="Enter staff email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className={styles.inputGroup}>
          <label>Password</label>
          <input
            type="password"
            placeholder="Enter staff password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && <p className={styles.errorMessage}>{error}</p>}
        {message && <p className={styles.successMessage}>{message}</p>}

        <button type="submit" className={styles.addStaffBtn}>Add Staff</button>
        <button onClick={()=>{navigate(-1)}} className={styles.cancleBtn}>Cancel</button>
      </form>
    </div>
  );
};

export default AddStaff;