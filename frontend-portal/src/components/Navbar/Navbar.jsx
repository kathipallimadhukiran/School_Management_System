import React from "react";
import "./Navbar.css";

const Navbar = () => {
  return (
    <div className="navbar">
      <div className="main_nav">
        <div className="logo">School Management System</div>
        <div className="login">
          <select>
            <option>Login</option>
            <option value="Admin login">Admin login</option>
            <option value="Staff login">Staff login</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
