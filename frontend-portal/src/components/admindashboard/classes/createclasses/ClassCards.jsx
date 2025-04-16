import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { MdAddChart } from "react-icons/md";
import styles from "./ClassCards.module.css";

const ClassCards = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  const navigate = useNavigate();
  const location = useLocation();
  const selectedClassId = location.state?.classId;

  const API_URL = import.meta.env.VITE_API_URL;


  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await fetch(`${API_URL}/getAllClass`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Fetch failed");

        const teacherIds = [
          ...new Set(
            data.flatMap(cls =>
              (cls.sections || []).map(s => s.teacherId).filter(Boolean)
            )
          )
        ];

        const tRes = await fetch(`${API_URL}/getTeachersByIds`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ teacherIds }),
        });

        const tData = await tRes.json();
        const teachers = Array.isArray(tData)
          ? tData
          : tData.teachers
          ? tData.teachers
          : [tData];

        const teacherMap = {};
        teachers.forEach(t => {
          teacherMap[t._id] = t.name;
        });

        const updated = data.map(cls => ({
          ...cls,
          sections: cls.sections.map(sec => ({
            ...sec,
            teacherName: teacherMap[sec.teacherId] || "Unknown"
          }))
        }));

        setClasses(updated);
      } catch (err) {
        console.error("Error fetching classes:", err);
      }
    };

    fetchClasses();
  }, [selectedClassId]);

  const handleSectionClick = (clsId, sec) => {
    navigate("/AdminDashboard/ClassManagement/manageclass", {
      state: {
        classId: clsId,
        sectionId: sec._id,
        sectionName: sec.name,
      },
    });
  };

  const getValidSections = (sectionsArray) => {
    if (!Array.isArray(sectionsArray)) return [];
    return sectionsArray.filter(sec => sec?.name);
  };

  return (
    <div className={styles.dashboard}>
      <h1>All Classes</h1>
      <div className={styles.classGrid}>
        {classes.map(cls => (
          <div
            key={cls._id}
            className={styles.classCard}
            onClick={() => setSelectedClass(cls)}
          >
            <strong>{cls.name}</strong>
          </div>
        ))}
      </div>

      {/* Modal */}
      {selectedClass && (
        <div className={styles.modalOverlay} onClick={() => setSelectedClass(null)}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>{selectedClass.name} - Sections</h3>
            <div className={styles.sectionList}>
              {getValidSections(selectedClass.sections).length ? (
                selectedClass.sections.map(sec => (
                  <div
                    key={sec._id}
                    className={styles.sectionCard}
                    onClick={() => handleSectionClick(selectedClass._id, sec)}
                  >
                    ➡️ {sec.name} (👨‍🏫 {sec.teacherName})
                  </div>
                ))
              ) : (
                <p>No sections available</p>
              )}
            </div>
            <div className={styles.modalButtons}>
              <button onClick={() => setSelectedClass(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      <ul className={styles.menu}>
        <li className={styles.menuItem}>
          <Link to="/MarksManagement" className={styles.menuLink}>
            <MdAddChart />
            {screenWidth > 700 && <span>Manage Marks</span>}
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default ClassCards;
