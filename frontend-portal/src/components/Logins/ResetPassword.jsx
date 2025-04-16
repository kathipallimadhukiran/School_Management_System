import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Login.module.css";

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  const token = new URLSearchParams(window.location.search).get("token");

  useEffect(() => {
    if (!token) {
      setMessage("Invalid or expired token.");
    }
  }, [token]);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!newPassword || !confirmPassword) {
      setMessage("Please fill in both password fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/ResetPassword`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });

      const result = await res.json();
      if (res.ok) {
        setMessage("Password reset successful! Redirecting to login...");
        setTimeout(() => navigate("/Login"), 3000);
      } else {
        setMessage(result.message || "Reset failed.");
      }
    } catch (error) {
      setMessage("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.resetPage}>
      <div className={styles.resetCard}>
        <h2>Reset Your Password</h2>

        {message && (
          <div className={message.includes("successful") ? styles.successMsg : styles.errorMsg}>
            {message}
          </div>
        )}

        {!message.includes("successful") && (
          <form onSubmit={handleResetPassword}>
            <div className={styles.inputGroup}>
              <label htmlFor="newPassword">New Password</label>
              <input
                type="password"
                id="newPassword"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="confirmPassword">Re-enter Password</label>
              <input
                type="password"
                id="confirmPassword"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <button type="submit" disabled={loading}>
              {loading ? <div className={styles.spinner} /> : "Reset Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
