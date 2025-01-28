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
import { Link } from 'react-router-dom';  // Import Link
import { IoPersonAddSharp, IoSearchSharp } from "react-icons/io5";
import { CgProfile } from "react-icons/cg";

import "./sidebar.css";

const Sidebar = () => {
  const [barStatus, setBarStatus] = useState(true);
  const [dashboardExpanded, setDashboardExpanded] = useState(false);

  return (
    <div className={`sidebar ${barStatus ? "expanded" : "compressed"}`}>
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
              <MdDashboard />
              {barStatus && <Link to="/">Dashboard</Link>}  
            </div>
            {dashboardExpanded && barStatus && (
              <ul className="submenu">
                <li>
                  <a href="#">Overview</a>
                </li>
                <li>
                  <a href="#">Students</a>
                </li>
                <li>
                  <a href="#">Teachers</a>
                </li>
                <li>
                  <a href="#">Payments</a>
                </li>
                <li>
                  <a href="#">Reports</a>
                </li>
              </ul>
            )}
          </li>
          <li className="menu-item">
            <IoPersonAddSharp />
            {barStatus && <Link to="/admissions">New Admission</Link>}  {/* Updated Link */}
          </li>
          <li className="menu-item">
            <MdOutlinePayments />
            {barStatus && <Link to="/Feepayments">Fee Payments</Link>}  {/* Updated Link */}
          </li>
          <li className="menu-item">
            <MdAddChart />
            {barStatus && <Link to="#">Marks Entry</Link>}  {/* Updated Link */}
          </li>
          <li className="menu-item">
            <MdSystemSecurityUpdateGood />
            {barStatus && <Link to="#">Update Student Data</Link>}  {/* Updated Link */}
          </li>
          <li className="menu-item">
            <IoSearchSharp />
            {barStatus && <Link to="#">Student Enquiry</Link>}  {/* Updated Link */}
          </li>
        </ul>
        <div className="profile-section">
          <CgProfile />
          {barStatus && <Link to="#">Profile</Link>}  {/* Updated Link */}
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
