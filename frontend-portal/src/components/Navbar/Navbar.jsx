import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TiThMenu } from "react-icons/ti";

import styles from "../Navbar/Navbar.module.css";

const Navbar = ({ toggleSidebar }) => {
  const navigate = useNavigate();
  const authToken = localStorage.getItem("authToken");
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768); // Track mobile screen size

  // Handle scroll event
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle screen resize event
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogin = () => {
    navigate("/Login");
  };

  const handleLogout = () => {
      localStorage.removeItem("email");
      localStorage.removeItem("authToken");
      localStorage.removeItem("userRole");
      localStorage.removeItem("userid");
      localStorage.removeItem("userName");
  

    navigate("/Login");
  };

  return (
    <div className={`${styles.navbar} ${isScrolled ? styles.scrolled : ""}`}>
      <div className={styles.mainNav}>
        {/* Menu Button (Visible only on mobile) */}
        {isMobile && (
          <button className={styles.menuButton} onClick={toggleSidebar}>
           <TiThMenu  style={{color:"white" ,fontSize:25}}/>

          </button>
        )}

        {/* Logo */}
        <div className={styles.logo}>School Management System</div>

        {/* Login/Logout Button */}
        <div className={styles.login}>
          {authToken ? (
            <button className={styles.authBtn} onClick={handleLogout}>
              Logout
            </button>
          ) : (
            <button className={styles.authBtn} onClick={handleLogin}>
              Login
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;