import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // ✅ Eye Icon
import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [forgotPassword, setForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const API_URL = "https://school-site-2e0d.onrender.com/";

  // ✅ Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!email || !password) {
      setError("Please enter email and password.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/Login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (response.ok) {
        localStorage.setItem("authToken", result.token);
        localStorage.setItem("userRole", result.role);
        alert(`Login successful! Welcome ${result.role}`);
        navigate("/Dashboard");
      } else {
        setError(result.message || "Invalid credentials!");
      }
    } catch (err) {
      setError("Server error. Please try again.");
    }
  };

  // ✅ Handle Forgot Password Request
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!resetEmail) {
      setError("Please enter your email.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/ForgotPassword`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage("Password reset link sent! Check your email.");
      } else {
        setError(result.message || "Failed to send reset link.");
      }
    } catch (err) {
      setError("Server error. Please try again.");
    }
  };

  return (
    <div className="login-container">
      {forgotPassword ? (
        <div className="forgot-password">
          <h2>Forgot Password</h2>
          <form onSubmit={handleForgotPassword}>
            <div className="input-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
              />
            </div>
            {error && <p className="error-message">{error}</p>}
            {message && <p className="success-message">{message}</p>}
            <button type="submit">Send Reset Link</button>
          </form>
          <p className="toggle-link">
            Remembered your password?{" "}
            <span className="blue-text" onClick={() => setForgotPassword(false)}>
              Back to Login
            </span>
          </p>
        </div>
      ) : (
        <>
          <h2>Staff/Admin Login</h2>
          <form onSubmit={handleLogin}>
            <div className="input-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* ✅ Password with Eye Icon */}
            <div className="input-group password-container">
              <label>Password</label>
              <div className="password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <span
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
            </div>

            {error && <p className="error-message">{error}</p>}
            {message && <p className="success-message">{message}</p>}

            <button type="submit">Login</button>
          </form>

          {/* ✅ Forgot Password as Blue Text */}
          <p className="forgot-password-link">
            <span className="blue-text" onClick={() => setForgotPassword(true)}>
              Forgot Password?
            </span>
          </p>
        </>
      )}
    </div>
  );
};

export default Login;
