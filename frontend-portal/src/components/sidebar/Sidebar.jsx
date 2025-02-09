import React, { useState } from "react";
import {
  TbLayoutSidebarLeftExpandFilled,
  TbLayoutSidebarLeftCollapseFilled,
} from "react-icons/tb";
import {
  MdDashboard,
  MdOutlinePayments,
  MdAddChart,
  MdSystemSecurityUpdateGood,
} from "react-icons/md";
import { FaHome } from "react-icons/fa";
import { Link } from 'react-router-dom';  // Import Link
import { IoPersonAddSharp, IoSearchSharp } from "react-icons/io5";
import { CgProfile } from "react-icons/cg";

import "./sidebar.css";

const Sidebar = () => {
  const [barStatus, setBarStatus] = useState(true);
  const [dashboardExpanded, setDashboardExpanded] = useState(false);

  return (
    <div className={`sidebar ${barStatus ? "expanded" : "compressed"}`} >
    <div className="bar-icon" onClick={() => setBarStatus(!barStatus)}>
      {barStatus ? (
        <TbLayoutSidebarLeftCollapseFilled />
      ) : (
        <TbLayoutSidebarLeftExpandFilled />
      )}
    </div>
    <nav className="menu">
      <ul className="menu-list">
        <li>
          <div
            className="menu-item"
            onClick={() => setDashboardExpanded(!dashboardExpanded)}
          >
            <Link to="/Dashboard" className="menu-link">
              <MdDashboard />
              {barStatus && <span>Dashboard</span>}
            </Link>
          </div>
          {dashboardExpanded && barStatus && (
            <ul className="submenu">
              <li><a href="#dashboard">Overview</a></li>
              <li><a href="#students">Students</a></li>
              <li><a href="#payments">Payments</a></li>
              <li><a href="#Reports">Reports</a></li>
              <li><a href="#Teachers">Teachers</a></li>
            </ul>
          )}
        </li>
        <li className="menu-item">
          <Link to="/admissions" className="menu-link">
            <IoPersonAddSharp />
            {barStatus && <span>New Admission</span>}
          </Link>
        </li>
        <li className="menu-item">
          <Link to="/Feepayments" className="menu-link">
            <MdOutlinePayments />
            {barStatus && <span>Fee Payments</span>}
          </Link>
        </li>
        <li className="menu-item">
          <Link to="#" className="menu-link">
            <MdAddChart />
            {barStatus && <span>Marks Entry</span>}
          </Link>
        </li>
        <li className="menu-item">
          <Link to="#" className="menu-link">
            <MdSystemSecurityUpdateGood />
            {barStatus && <span>Update Student Data</span>}
          </Link>
        </li>
        <li className="menu-item">
          <Link to="#" className="menu-link">
            <IoSearchSharp />
            {barStatus && <span>Student Enquiry</span>}
          </Link>
        </li>
      </ul>
      <div className="profile-section">
        <Link to="#" className="menu-link">
          <CgProfile />
          {barStatus && <span>Profile</span>}
        </Link>
      </div>
    </nav>
  </div>  );
};

export default Sidebar;
