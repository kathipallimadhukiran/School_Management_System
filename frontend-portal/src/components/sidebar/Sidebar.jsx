import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  TbLayoutSidebarLeftExpandFilled,
  TbLayoutSidebarLeftCollapseFilled,
} from "react-icons/tb";
import { MdDashboard, MdOutlinePayments, MdAddChart, MdSystemSecurityUpdateGood } from "react-icons/md";
import { IoPersonAddSharp } from "react-icons/io5";

import styles from "./sidebar.module.css"; // Using CSS Modules

const Sidebar = ({ width, isMobile, toggleSidebar }) => {
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    // Retrieve user role from localStorage
    const storedUserRole = localStorage.getItem("userRole");
    setUserRole(storedUserRole);
  }, []);
  return (
    <div
      className={`${styles.sidebar} ${width > 70 ? styles.expanded : styles.compressed} ${isMobile ? styles.mobile : ""}`}
      style={{ width: `${width}px` }}
    >
      <div className={styles.barIcon} onClick={toggleSidebar}>
        {width > 70 ? <TbLayoutSidebarLeftCollapseFilled /> : <TbLayoutSidebarLeftExpandFilled />}
      </div>
      <nav className={styles.menu}>
        <ul className={styles.menuList}>


             {/* Show Admin Dashboard only for Admins */}
             {userRole === "Admin"? (
            <li className={styles.menuItem}>
              <Link to="/AdminDashboard" className={styles.menuLink} onClick={toggleSidebar}>
                <MdDashboard />
                {width > 70 && <span>Admin Dashboard</span>}
              </Link>
            </li>
          ):(
            <li className={styles.menuItem}>
            <Link to="/Dashboard" className={styles.menuLink} onClick={toggleSidebar}>
              <MdDashboard />
              {width > 70 && <span>Dashboard</span>}
            </Link>
          </li>
          )}
         
          <li className={styles.menuItem}>
            <Link to="/admissions" className={styles.menuLink} onClick={toggleSidebar}>
              <IoPersonAddSharp />
              {width > 70 && <span>New Admission</span>}
            </Link>
          </li>
          <li className={styles.menuItem}>
            <Link to="/Feepayments" className={styles.menuLink} onClick={toggleSidebar}>
              <MdOutlinePayments />
              {width > 70 && <span>Fee Payments</span>}
            </Link>
          </li>
          <li className={styles.menuItem}>
            <Link to="/MarksManagement" className={styles.menuLink} onClick={toggleSidebar}>
              <MdAddChart />
              {width > 70 && <span>Marks Entry</span>}
            </Link>
          </li>
          <li className={styles.menuItem}>
            <Link to="/StudentManagement" className={styles.menuLink} onClick={toggleSidebar}>
              <MdSystemSecurityUpdateGood />
              {width > 70 && <span>Update Student Data</span>}
            </Link>
          </li>

       
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
