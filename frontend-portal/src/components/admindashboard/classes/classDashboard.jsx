import { Link, useNavigate } from "react-router-dom";
import styles from "./classDashboard.module.css";
import { useState, useEffect } from "react";

const ClassManagement = () => {
  const [classes, setClasses] = useState([]);
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await fetch(`${API_URL}/getAllClass`);
        const data = await res.json();
        console.log("📚 Classes:", data);

        if (!res.ok) throw new Error(data.message || "Unable to fetch classes");

        const teacherIds = [...new Set(data.map(cls => cls.teacherId).filter(Boolean))];
        console.log("🆔 Teacher IDs:", teacherIds);

        const teacherRes = await fetch(`${API_URL}/getTeachersByIds`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ teacherIds }),
        });

        const teacherJson = await teacherRes.json();
        console.log("👨‍🏫 Teacher API response:", teacherJson);

        // FIXED: Handle single teacher object or array
        const teachers = Array.isArray(teacherJson)
          ? teacherJson
          : teacherJson.teachers
          ? teacherJson.teachers
          : [teacherJson]; // fallback if it's a single teacher object

        const teacherMap = {};
        teachers.forEach(t => {
          teacherMap[t._id] = t.name;
        });

        const updatedClasses = data.map(cls => ({
          ...cls,
          teacherName: teacherMap[cls.teacherId] || "Unknown",
        }));

        console.log("🔁 Updated Classes:", updatedClasses);
        setClasses(updatedClasses);
      } catch (err) {
        console.error("🚨 Error fetching classes:", err);
        setClasses([]);
      }
    };

    fetchClasses();
  }, []);

  const handleSelectClass = (cls) => {
    navigate("classcards", { state: { classId: cls._id } });
  };

  return (
    <div className={styles.dashboard}>
      <h1>Manage Classes</h1>

      <div className={styles.cardContainer}>
        <Link to="createclass" className={styles.card}>
          📚 <h2>Create Class</h2>
        </Link>
        <Link to="/AdminDashboard/AddStaff" className={styles.card}>
          👩‍🏫 <h2>Add Teacher</h2>
        </Link>
        <Link to="/admissions" className={styles.card}>
          🎓 <h2>Add Student</h2>
        </Link>
        <Link to="Addsubject" className={styles.card}>
          📖 <h2>Add Subject</h2>
        </Link>
      </div>

      <div className={styles.formContainer}>
        <h2>Existing Classes</h2>
        <div className={styles.classGrid}>
          {classes.map(cls => (
            <div
              key={cls._id}
              className={styles.classCard}
              onClick={() => handleSelectClass(cls)}
            >
              <strong>{cls.name}</strong>
              <div className={styles.teacherName}>👨‍🏫 {cls.teacherName}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ClassManagement;
