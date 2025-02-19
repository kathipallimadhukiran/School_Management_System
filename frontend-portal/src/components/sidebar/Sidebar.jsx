import React from "react";
import { Link } from "react-router-dom";
import {
  TbLayoutSidebarLeftExpandFilled,
  TbLayoutSidebarLeftCollapseFilled,
} from "react-icons/tb";
import { MdDashboard, MdOutlinePayments, MdAddChart, MdSystemSecurityUpdateGood } from "react-icons/md";
import { IoPersonAddSharp, IoSearchSharp } from "react-icons/io5";
import { CgProfile } from "react-icons/cg";
import { FaUserPlus } from "react-icons/fa";

import styles from "./Sidebar.module.css"; // Using CSS Modules

const Sidebar = ({ width, isMobile, toggleSidebar }) => {
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
          <li className={styles.menuItem}>
            <Link to="/Dashboard" className={styles.menuLink}>
              <MdDashboard />
              {width > 70 && <span>Dashboard</span>}
            </Link>
          </li>
          <li className={styles.menuItem}>
            <Link to="/admissions" className={styles.menuLink}>
              <IoPersonAddSharp />
              {width > 70 && <span>New Admission</span>}
            </Link>
          </li>
          <li className={styles.menuItem}>
            <Link to="/Feepayments" className={styles.menuLink}>
              <MdOutlinePayments />
              {width > 70 && <span>Fee Payments</span>}
            </Link>
          </li>
          <li className={styles.menuItem}>
            <Link to="#" className={styles.menuLink}>
              <MdAddChart />
              {width > 70 && <span>Marks Entry</span>}
            </Link>
          </li>
          <li className={styles.menuItem}>
            <Link to="#" className={styles.menuLink}>
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
