import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  TbLayoutSidebarLeftExpandFilled,
  TbLayoutSidebarLeftCollapseFilled,
} from "react-icons/tb";
import {
  MdDashboard,
  MdOutlinePayments,
  MdAddChart,
  MdSystemSecurityUpdateGood,
  MdOutlineLibraryBooks,
  MdOutlineClass,
  MdOutlineCheckCircle,
  MdPerson,
} from "react-icons/md";
import { IoPersonAddSharp } from "react-icons/io5";

import styles from "./sidebar.module.css"; // CSS Modules

const Sidebar = ({ width, isMobile, toggleSidebar }) => {
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const storedUserRole = localStorage.getItem("userRole");
    setUserRole(storedUserRole);
  }, []);

  const renderMenuItem = (to, icon, label) => (
    <li className={styles.menuItem} key={to}> {/* Added key here */}
      <Link to={to} className={styles.menuLink} onClick={toggleSidebar}>
        {icon}
        {width > 70 && <span>{label}</span>}
      </Link>
    </li>
  );

  const adminLinks = [
    { to: "/AdminDashboard", icon: <MdDashboard />, label: "Admin Dashboard" },
    { to: "/admissions", icon: <IoPersonAddSharp />, label: "New Admission" },
    { to: "/Feepayments", icon: <MdOutlinePayments />, label: "Fee Payments" },
    { to: "/StudentManagement", icon: <MdSystemSecurityUpdateGood />, label: "Update Student Data" },
  ];

  const teacherLinks = [
    { to: "/Dashboard", icon: <MdDashboard />, label: "Dashboard" },
    { to: "/Attendance", icon: <MdOutlineCheckCircle />, label: "Attendance" },
    { to: "/ClassOverview", icon: <MdOutlineClass />, label: "Class Overview" },
    { to: "/StaffProfile", icon: <MdPerson />, label: "My Profile" },
  ];

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
          {userRole === "Admin"
            ? adminLinks.map(item => renderMenuItem(item.to, item.icon, item.label))
            : teacherLinks.map(item => renderMenuItem(item.to, item.icon, item.label))
          }

          {/* Common to both roles */}
          {renderMenuItem("/MarksManagement", <MdAddChart />, "Marks Entry")}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
