import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import styles from "./Login.module.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [forgotPassword, setForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;


  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
  
    if (!email || !password) {
      setError("Please enter email and password.");
      setLoading(false);
      return;
    }
  
    try {
      const response = await fetch(`${API_URL}/Login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.toLowerCase(), password }),
      });
  
      const result = await response.json();
      console.log(result);

      if (response.ok) {
        localStorage.setItem("email", result.email);
        localStorage.setItem("authToken", result.token);
        localStorage.setItem("userRole", result.role);
        localStorage.setItem("userid", result.id);
        localStorage.setItem("userName", result.Name);
          
        toast.success(`Login successful! Welcome ${result.role}`);
  
       
        
        
        if (result.role === "Admin") {
            navigate("/AdminDashboard");

          } 
        
        if (result.role === "Staff") {
            navigate("/Dashboard");
          } 


       


      } else {
        setError(result.message || "Invalid credentials!");
      }
    } catch (err) {
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    if (!resetEmail) {
      setError("Please enter your email.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/ForgotPassword`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail.toLowerCase() }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage("Password reset link sent! Check your email.");
      } else {
        setError(result.message || "Failed to send reset link.");
      }
    } catch (err) {
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginContainer}>
        {forgotPassword ? (
          <div className="forgot-password">
            <h2>Forgot Password</h2>
            <form onSubmit={handleForgotPassword}>
              <div className={styles.inputGroup}>
                <label>Email</label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                />
              </div>
              {error && <p className={styles.errorMessage}>{error}</p>}
              {message && <p className={styles.successMessage}>{message}</p>}
              <button type="submit" disabled={loading}>
                {loading ? <div className={styles.loadingSpinner} /> : "Send Reset Link"}
              </button>
            </form>
            <p className={styles.forgotPasswordLink}>
              Remembered your password?{" "}
              <span className={styles.blueText} onClick={() => setForgotPassword(false)}>
                Back to Login
              </span>
            </p>
          </div>
        ) : (
          <>
            <h2>Staff/Admin Login</h2>
            <form onSubmit={handleLogin}>
              <div className={styles.inputGroup}>
                <label>Email</label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className={styles.inputGroup}>
                <label>Password</label>
                <div className={styles.passwordWrapper}>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <span
                    className={styles.togglePassword}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>
              </div>
              {error && <p className={styles.errorMessage}>{error}</p>}
              {message && <p className={styles.successMessage}>{message}</p>}
              <button type="submit" disabled={loading}>
                {loading ? <div className={styles.loadingSpinner} /> : "Login"}
              </button>
            </form>
            <p className={styles.forgotPasswordLink}>
              <span className={styles.blueText} onClick={() => setForgotPassword(true)}>
                Forgot Password?
              </span>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default Login;







//1 st comoferinjbg

// dhani puku dengu