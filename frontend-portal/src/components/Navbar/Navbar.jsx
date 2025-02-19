import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../Navbar/Navbar.module.css";

const Navbar = () => {
  const navigate = useNavigate();
  const authToken = localStorage.getItem("authToken");
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogin = () => {
    navigate("/Login");
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/Login");
  };

  return (
    <div className={`${styles.navbar} ${isScrolled ? styles.scrolled : ""}`}>
      <div className={styles.mainNav}>
        <div className={styles.logo}>School Management System</div>
        <div className={styles.login}>
          {authToken ? (
            <button className={styles.authBtn} onClick={handleLogout}>Logout</button>
          ) : (
            <button className={styles.authBtn} onClick={handleLogin}>Login</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
