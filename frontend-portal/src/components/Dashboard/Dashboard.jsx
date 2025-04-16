import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MdClass, MdEvent, MdCheckCircle } from "react-icons/md";
import { FaUserGraduate, FaClipboardList } from "react-icons/fa";
import styles from "./Dashboard.module.css";

const Dashboard = () => {
  const [assignedClasses, setAssignedClasses] = useState(0);
  const [studentsInClasses, setStudentsInClasses] = useState(0);
  const [pendingGrading, setPendingGrading] = useState(0);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [teaherdata, setteaherdata] = useState([]);
  const [attendanceOverview, setAttendanceOverview] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchTeacherData = async () => {
      try {
        const response = await fetch(`${API_URL}/dashboard`);
        if (!response.ok) throw new Error("Failed to fetch data");
        
        const data = await response.json();
        
        
        setteaherdata(data);
        
        setAssignedClasses(teaherdata.name);
        setStudentsInClasses(teaherdata.students);
        setPendingGrading(data.pendingGrading);
        setUpcomingEvents(data.upcomingEvents);

        setAttendanceOverview(data.attendanceOverview);
      } catch (error) {
        console.error("Error fetching teacher data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherData();
  }, []);

  return (
    <div className={styles.dashboard}>
      <h2>Welcome, Teacher</h2>
      <p>Here’s your daily overview</p>

      <div className={styles.cards}>
        <div className={styles.card}>
          <MdClass className={styles.icon} />
          <h3>Assigned Classes</h3>
          <p>{loading ? "Loading..." : assignedClasses}</p>
        </div>

        <div className={styles.card}>
          <FaUserGraduate className={styles.icon} />
          <h3>Total Students</h3>
          <p>{loading ? "Loading..." : studentsInClasses}</p>
        </div>

        <div className={styles.card}>
          <FaClipboardList className={styles.icon} />
          <h3>Pending Grading</h3>
          <p>{loading ? "Loading..." : pendingGrading}</p>
        </div>

        <div className={styles.card}>
          <MdEvent className={styles.icon} />
          <h3>Upcoming Events</h3>
          <p>{loading ? "Loading..." : upcomingEvents.length}</p>
        </div>

        <div className={styles.card}>
          <MdCheckCircle className={styles.icon} />
          <h3>Attendance Overview</h3>
          <p>{loading ? "Loading..." : `${attendanceOverview}%`}</p>
        </div>
      </div>

      <button className={styles.viewMore} onClick={() => navigate("/teacher/details")}>
        View More Details
      </button>
    </div>
  );
};

export default Dashboard;
