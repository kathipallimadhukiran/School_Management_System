import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
const AddStaff = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const API_URL = "http://localhost:3000";

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
        setTimeout(() => navigate("/AdminDashboard"), 2000); // Redirect to Admin Dashboard
      } else {
        setError(result.message || "Signup failed!");
      }
    } catch (err) {
      setError("Server error. Please try again.");
    }
  };

  return (
    <div className="add-staff-container">
      <h2>Add New Staff</h2>
      <form onSubmit={handleSignup}>
        <div className="input-group">
          <label>Name</label>
          <input
            type="text"
            placeholder="Enter staff name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="input-group">
          <label>Email</label>
          <input
            type="email"
            placeholder="Enter staff email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="input-group">
          <label>Password</label>
          <input
            type="password"
            placeholder="Enter staff password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && <p className="error-message">{error}</p>}
        {message && <p className="success-message">{message}</p>}

        <button type="submit">Add Staff</button>
      </form>
    </div>
  );
};

export default AddStaff;
