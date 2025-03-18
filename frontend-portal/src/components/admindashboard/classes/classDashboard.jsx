import { Link, useNavigate } from "react-router-dom";
import styles from "./classDashboard.module.css"; // Import CSS Module
import { useState, useEffect } from "react";

const ClassManagement = () => {
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [teacher, setTeacher] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAddStudentPopup, setShowAddStudentPopup] = useState(false); // New state for Add Student Popup
  const navigate = useNavigate();

  // Fetch all classes on component mount
  useEffect(() => {
    fetch("http://localhost:3000/getAllClass")
      .then((response) => response.json())
      .then((data) => setClasses(data))
      .catch((error) => console.error("Error fetching classes:", error));
  }, []);

  const handleNavigate = async (cls) => {
    setLoading(true);
    navigate("manageclass", { state: { classId: cls._id } });
  }



  // Fetch class details when a class is selected
  const handleSelectClass = async (cls) => {
    setLoading(true);
    setSelectedClass(cls);

    try {
      const response = await fetch(`http://localhost:3000/getClassById/${cls._id}`);
      if (!response.ok) throw new Error("Failed to fetch class details");

      const data = await response.json();
      setTeacher(data.teacherId || null);

      if (data.students && data.students.length > 0) {
        const studentResponse = await fetch("http://localhost:3000/getStudentsByIds", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ studentIds: data.students }),
        });

        if (!studentResponse.ok) throw new Error("Failed to fetch students");

        const studentData = await studentResponse.json();
        setStudents(studentData);
      } else {
        setStudents([]);
      }





      const TeacherResponse = await fetch("http://localhost:3000/getTeachersByIds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teacherIds: data.teacherId }),
      });

      if (!TeacherResponse.ok) throw new Error("Failed to fetch students");

      const Teacherdata = await TeacherResponse.json();
      setTeacher(Teacherdata);
    







    } catch (error) {
    console.error("Error fetching class details:", error);
  } finally {
    setLoading(false);
  }
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
      <div className={styles.card} onClick={() => setShowAddStudentPopup(true)}>
        🎓 <h2>Add Student</h2>
      </div>
      <Link to="createclass" className={styles.card}>
        📖 <h2>Add Subject</h2>
      </Link>
      <Link to="createclass" className={styles.card}>
        📅 <h2>Create Schedule</h2>
      </Link>
    </div>

    <div className={styles.formContainer}>
      <h2>Existing Classes</h2>
      <div className={styles.classGrid}>
        {classes.map((cls) => (
          <div key={cls._id} className={styles.classCard} onClick={() => handleSelectClass(cls)}>
            {cls.name}
          </div>
        ))}
      </div>

      {/* Modal (Popup) for Class Details */}
      {selectedClass && (
        <div className={styles.modalOverlay} >
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2>{selectedClass.name}</h2>

            {/* Teacher Info */}
            <h3>Teacher</h3>
            {loading ? (
              <p>Loading teacher...</p>
            ) : teacher ? (
              <div className={styles.teacherInfo}>
                <p><strong>Class Teacher:</strong> {teacher.name} ({teacher.email})</p>
              </div>
            ) : (
              <p>No teacher assigned.</p>
            )}

            {/* Students List */}
            <h3>Students</h3>
            {loading ? (
              <p>Loading students...</p>
            ) : (
              <ul className={styles.studentList}>
                {students.length > 0 ? (
                  students.map((student) => (
                    <li key={student._id} className={styles.studentItem}>
                      {student.Student_name} ({student.Registration_number})
                     
                    </li>
                  ))
                ) : (
                  <p>No students found.</p>
                )}
              </ul>
            )}

            {/* Add Student Button */}
            <button className={styles.addButton} onClick={() => handleNavigate(selectedClass)}>
              ✏️ Edit
            </button>

            <button className={styles.closeButton} onClick={() => setSelectedClass(null)}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* 🔹 New Add Student Popup */}
      {showAddStudentPopup && (
        <div className={styles.modalOverlay} onClick={() => setShowAddStudentPopup(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2>Select a Class</h2>
            <div className={styles.classGrid}>
              {classes.map((cls) => (
                <div key={cls._id} className={styles.classCard} onClick={() => handleNavigate(cls)}>
                  {cls.name}
                </div>
              ))}
            </div>
            <button className={styles.closeButton} onClick={() => setShowAddStudentPopup(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  </div>
);
};

export default ClassManagement;