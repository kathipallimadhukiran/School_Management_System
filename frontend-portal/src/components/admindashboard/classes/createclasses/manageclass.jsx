import { useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import styles from "./manageclass.module.css";

const Manageclass = () => {
    const location = useLocation();
    const { classId, sectionId } = location.state || {};
    const API_URL = import.meta.env.VITE_API_URL;

    const [sectionDetails, setSectionDetails] = useState(null);
    const [students, setStudents] = useState([]);
    const [teacher, setTeacher] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showAddStudents, setShowAddStudents] = useState(false);
    const [showAddTeachers, setShowAddTeachers] = useState(false);
    const [availableStudents, setAvailableStudents] = useState([]);
    const [availableTeachers, setAvailableTeachers] = useState([]);
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [selectedTeacher, setSelectedTeacher] = useState(null);

    useEffect(() => {
        const fetchAvailableTeachers = async () => {
            try {
                const response = await fetch(`${API_URL}/getAllTeachers`);
                const data = await response.json();
                setAvailableTeachers(data);
            } catch (err) {
                console.error("Failed to fetch teachers:", err);
            }
        };

        const fetchSectionDetails = async () => {
            try {
                const response = await fetch(`${API_URL}/getSectionDetails/${sectionId}`);
                if (!response.ok) throw new Error("Failed to fetch section");
                const data = await response.json();
                setSectionDetails(data);
                setTeacher(data.teacher || null);
            } catch (err) {
                console.error("Error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchSectionDetails();
        fetchAvailableTeachers();
    }, [sectionId]);

    useEffect(() => {
        const fetchStudentsNames = async () => {
            if (!sectionDetails?.students?.length) return;

            try {
                const response = await fetch(`${API_URL}/getStudentsByIds`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ studentIds: sectionDetails.students }),
                });

                const data = await response.json();
                setStudents(data);
            } catch (err) {
                console.error("Failed to fetch students:", err);
            }
        };

        fetchStudentsNames();
    }, [sectionDetails]);

    const fetchAvailableStudents = async () => {
        try {
            const response = await fetch(`${API_URL}/getStudents?grade=Unassigned`);
            const data = await response.json();
            const assignedIds = students.map((s) => s._id);
            const unassigned = data.data?.filter((s) => !assignedIds.includes(s._id)) || [];
            setAvailableStudents(unassigned);
        } catch (err) {
            console.error("Failed to fetch available students:", err);
        }
    };

    useEffect(() => {
        if (students.length >= 0) fetchAvailableStudents();
    }, [students]);

    const handleAssignTeacher = async () => {
        try {
            const response = await fetch(`${API_URL}/assignTeacherToSection`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ classId, sectionId, teacherId: selectedTeacher }),
            });

            if (!response.ok) throw new Error("Failed to assign teacher");

            const updated = availableTeachers.find((t) => t._id === selectedTeacher);
            setTeacher(updated);
            setShowAddTeachers(false);
        } catch (err) {
            console.error("Error assigning teacher:", err);
        }
    };

    const handleAddStudents = async () => {
        if (!selectedStudents.length) return;
        try {
            const response = await fetch(`${API_URL}/assignStudentsToSection`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ classId, sectionId, studentIds: selectedStudents }),
            });

            if (!response.ok) throw new Error("Failed to add students");

            const studentResponse = await fetch(`${API_URL}/getStudentsByIds`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ studentIds: selectedStudents }),
            });

            const studentData = await studentResponse.json();

            console.log("🎓 Added Students:");
            studentData.forEach((s) =>
                console.log(`${s.Student_name} → New Grade: ${sectionDetails.sectionName}`)
            );

            setStudents((prev) => [...prev, ...studentData]);

            await Promise.all(selectedStudents.map((id) =>
                fetch(`${API_URL}/updateStudentGrade/${id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ newGrade: sectionDetails.sectionName }),
                })
            ));

            setSelectedStudents([]);
            setShowAddStudents(false);
            await fetchAvailableStudents();
        } catch (err) {
            console.error("Error adding students:", err);
        }
    };


    const handleAssignRollNumbers = async () => {
        if (!students.length) return alert("No students to assign roll numbers.");
    
        const startFrom = prompt("Enter starting roll number:", "1");
        if (!startFrom || !startFrom.trim()) return alert("Invalid roll number format.");
    
        try {
            const response = await fetch(`${API_URL}/assignRollNumbersToStudents`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sectionId,
                    studentIds: students.map((s) => s._id),
                    startFrom: startFrom.trim()
                }),
            });
    
            if (!response.ok) throw new Error("Backend failed to assign roll numbers");
    
            const updatedStudents = await response.json();
            setStudents(updatedStudents);
    
            alert("✅ Roll numbers assigned successfully.");
            window.location.reload();
        } catch (err) {
            console.error("Error assigning roll numbers:", err);
            alert("Failed to assign roll numbers.");
        }
    };
    
    
    const handleViewMarksReport = (studentId, name) => {
        // You can either show a modal or navigate to another route with studentId
        // Example: navigate to /studentMarksReport
        window.open(`/studentMarksReport/${studentId}`, "_blank");
      };
      

    const handleRemoveStudent = async (studentId, name) => {
        if (!confirm(`Are you sure you want to remove ${name}?`)) return;
    
        try {
            const response = await fetch(`${API_URL}/unassignStudentFromSection/${classId}/${sectionId}/${studentId}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
            });
    
            if (!response.ok) throw new Error("Failed to remove student");
    
            // Update student list locally
            const updatedStudents = students.filter((s) => s._id !== studentId);
            setStudents(updatedStudents);
    
            // Reset grade
            await fetch(`${API_URL}/updateStudentGrade/${studentId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ newGrade: "Unassigned" }),
            });
    
            // Now fetch available students using updated list
            const res = await fetch(`${API_URL}/getStudents?grade=Unassigned`);
            const data = await res.json();
            const assignedIds = updatedStudents.map((s) => s._id);
            const unassigned = data.data?.filter((s) => !assignedIds.includes(s._id)) || [];
            setAvailableStudents(unassigned);
    
        } catch (err) {
            console.error("Error removing student:", err);
        }
    };
    
    if (loading || !sectionDetails) return <p>Loading...</p>;

    return (
        <div className={styles.manageClassContainer}>
            <div className={styles.header}>
                <h2>{sectionDetails.sectionName}</h2>
                <div style={{ display: "flex", gap: "1rem" }}>
                <button className={styles.addButton} onClick={handleAssignRollNumbers}>🔢 Assign Roll Numbers</button>

                    <button className={styles.addButton} onClick={() => setShowAddStudents(true)}>➕ Add Students</button>
                    <button className={styles.addButton} onClick={() => setShowAddTeachers(true)}>✏️ Change Teacher</button>
                </div>
            </div>

            <div className={styles.content}>
                <div className={styles.teacherSection}>
                    <h3>Teacher</h3>
                    {teacher ? (
                        <p><strong>{teacher.name}</strong> ({teacher.staffID})</p>
                    ) : (
                        <p>No teacher assigned.</p>
                    )}
                </div>

                <div className={styles.studentsSection}>
                    <h3>Students</h3>
                    {students.length ? (
                       <table className={styles.studentTable}>
                       <thead>
                         <tr>
                           <th>S.No</th>
                           <th>Roll No</th>
                           <th>Name</th>
                           <th>Registration Number</th>
                           <th>Action</th>
                         </tr>
                       </thead>
                       <tbody>
                         {students.map((student, index) => (
                           <tr key={student._id}>
                             <td>{index + 1}</td>
                             <td>{student.Roll_No || "—"}</td>
                             <td>{student.Student_name}</td>
                             <td>{student.Registration_number}</td>
                             <td>
                             <button
  className={styles.MarksButton}
  onClick={() => handleViewMarksReport(student._id, student.Student_name)}
>
  🪪
</button>

                               <button
                                 className={styles.deleteButton}
                                 onClick={() => handleRemoveStudent(student._id, student.Student_name)}
                               >
                                 ❌
                               </button>
                             </td>
                           </tr>
                         ))}
                       </tbody>
                     </table>
                     
                    ) : (
                        <p>No students assigned.</p>
                    )}
                </div>
            </div>

            {showAddStudents && (
                <div className={styles.popupOverlay}>
                    <div className={styles.popupContent}>
                        <h3>Select Students</h3>
                        <ul className={styles.availableStudentsList}>
                            {availableStudents.length ? availableStudents.map((s) => (
                                <li key={s._id}>
                                    <label>
                                        <input
                                            type="checkbox"
                                            value={s._id}
                                            onChange={(e) => {
                                                const { value, checked } = e.target;
                                                setSelectedStudents((prev) =>
                                                    checked ? [...prev, value] : prev.filter((id) => id !== value)
                                                );
                                            }}
                                        />
                                        {s.Student_name} ({s.Registration_number})
                                    </label>
                                </li>
                            )) : <p>No unassigned students.</p>}
                        </ul>
                        <div className={styles.popupButtons}>
                            <button onClick={handleAddStudents}>Add Selected</button>
                            <button onClick={() => {
                                setSelectedStudents([]);
                                setShowAddStudents(false);
                            }}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {showAddTeachers && (
                <div className={styles.popupOverlay}>
                    <div className={styles.popupContent}>
                        <h3>Select Teacher</h3>
                        <ul>
                            {availableTeachers.map((t) => (
                                <li key={t._id}>
                                    <label>
                                        <input
                                            type="radio"
                                            name="teacher"
                                            value={t._id}
                                            onChange={() => setSelectedTeacher(t._id)}
                                        />
                                        {t.name} ({t.staffID})
                                    </label>
                                </li>
                            ))}
                        </ul>
                        <div className={styles.popupButtons}>
                            <button onClick={handleAssignTeacher}>Assign</button>
                            <button onClick={() => setShowAddTeachers(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Manageclass;
