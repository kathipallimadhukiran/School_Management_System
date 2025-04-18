import { useLocation } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
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
    const [showAssignSubjects, setShowAssignSubjects] = useState(false);
    const [showAddTeachers, setShowAddTeachers] = useState(false);
    const [availableStudents, setAvailableStudents] = useState([]);
    const [availableTeachers, setAvailableTeachers] = useState([]);
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [subjects, setSubjects] = useState([]);
    const [selectedSubjects, setSelectedSubjects] = useState([]);
    const [showChangeTeacherPopup, setShowChangeTeacherPopup] = useState(false);
    const [currentSubjectForTeacherChange, setCurrentSubjectForTeacherChange] = useState(null);
    const [newTeacherId, setNewTeacherId] = useState("");

    // Memoized unassigned subjects
    const unassignedSubjects = useMemo(() => {
        if (!sectionDetails?.subjects || !subjects.length) return subjects;
        const assignedSubjectIds = new Set(sectionDetails.subjects.map(s => s.subject));
        return subjects.filter(subject => !assignedSubjectIds.has(subject._id));
    }, [sectionDetails, subjects]);

    // Fetch all required data
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setLoading(true);
                const [subjectsRes, sectionRes, teachersRes] = await Promise.all([
                    fetch(`${API_URL}/getAllSubjects`),
                    fetch(`${API_URL}/getSectionDetails/${sectionId}`),
                    fetch(`${API_URL}/getAllTeachers`)
                ]);

                const [subjectsData, sectionData, teachersData] = await Promise.all([
                    subjectsRes.json(),
                    sectionRes.json(),
                    teachersRes.json()
                ]);

                setSubjects(subjectsData);
                setSectionDetails(sectionData);
                setTeacher(sectionData.teacher || null);
                setAvailableTeachers(teachersData);

                // Fetch students if they exist
                if (sectionData.students?.length) {
                    const studentsRes = await fetch(`${API_URL}/getStudentsByIds`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ studentIds: sectionData.students }),
                    });
                    const studentsData = await studentsRes.json();
                    setStudents(studentsData);
                }
            } catch (err) {
                console.error("Initial data fetch error:", err);
            } finally {
                setLoading(false);
            }
        };

        if (sectionId) fetchInitialData();
    }, [sectionId]);

    // Fetch available students when students list changes
    useEffect(() => {
        const fetchAvailableStudents = async () => {
            try {
                const response = await fetch(`${API_URL}/getStudents?grade=Unassigned`);
                const data = await response.json();
                const assignedIds = new Set(students.map(s => s._id));
                const unassigned = data.data?.filter(s => !assignedIds.has(s._id)) || [];
                setAvailableStudents(unassigned);
            } catch (err) {
                console.error("Failed to fetch available students:", err);
            }
        };

        fetchAvailableStudents();
    }, [students]);

    const handleAssignTeacher = async () => {
        try {
            const response = await fetch(`${API_URL}/assignTeacherToSection`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ classId, sectionId, teacherId: selectedTeacher }),
            });

            if (!response.ok) throw new Error("Failed to assign teacher");
            
            const updatedTeacher = availableTeachers.find(t => t._id === selectedTeacher);
            setTeacher(updatedTeacher);
            setShowAddTeachers(false);
        } catch (err) {
            console.error("Error assigning teacher:", err);
        }
    };

    const handleAddStudents = async () => {
        if (!selectedStudents.length) return;
        
        try {
            // Assign students to section
            await fetch(`${API_URL}/assignStudentsToSection`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ classId, sectionId, studentIds: selectedStudents }),
            });

            // Get updated student data
            const studentResponse = await fetch(`${API_URL}/getStudentsByIds`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ studentIds: selectedStudents }),
            });
            const studentData = await studentResponse.json();

            // Update students list
            setStudents(prev => [...prev, ...studentData]);

            // Update student grades in parallel
            await Promise.all(
                selectedStudents.map(id => 
                    fetch(`${API_URL}/updateStudentGrade/${id}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ newGrade: sectionDetails.sectionName }),
                    })
                )
            );

            // Reset and refresh
            setSelectedStudents([]);
            setShowAddStudents(false);
            window.location.reload();
        } catch (err) {
            console.error("Error adding students:", err);
        }
    };

    const handleAssignSubjects = async () => {
        try {
            setLoading(true);
            
            // Process all subject assignments in parallel
            const responses = await Promise.all(
                selectedSubjects.map(s => 
                    fetch(`${API_URL}/assignSubjectToClass`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            classId,
                            sectionId: sectionDetails.sectionId,
                            subjectId: s.subjectId,
                            teacherId: s.teacherId,
                        }),
                    })
                )
            );

            // Check for any failed assignments
            const failedResponse = responses.find(res => !res.ok);
            if (failedResponse) {
                const errorData = await failedResponse.json();
                throw new Error(errorData.message || "Failed to assign subjects");
            }

            // Refresh section data
            const refreshResponse = await fetch(`${API_URL}/getSectionDetails/${sectionId}`);
            const updatedSection = await refreshResponse.json();
            setSectionDetails(updatedSection);
            
            // Reset state
            setSelectedSubjects([]);
            setShowAssignSubjects(false);
            alert("Subjects assigned successfully!");
        } catch (error) {
            console.error("Assignment error:", error);
            alert(error.message || "Failed to assign subjects");
        } finally {
            setLoading(false);
        }
    };

    const handleAssignRollNumbers = async () => {
        if (!students.length) return alert("No students to assign roll numbers.");

        const startFrom = prompt("Enter starting roll number:", "1");
        if (!startFrom?.trim()) return alert("Invalid roll number format.");

        try {
            const response = await fetch(`${API_URL}/assignRollNumbersToStudents`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sectionId,
                    studentIds: students.map(s => s._id),
                    startFrom: startFrom.trim(),
                }),
            });

            if (!response.ok) throw new Error("Failed to assign roll numbers");
            
            const updatedStudents = await response.json();
            setStudents(updatedStudents);
            alert("✅ Roll numbers assigned successfully.");
            window.location.reload();
        } catch (err) {
            console.error("Error assigning roll numbers:", err);
            alert("Failed to assign roll numbers.");
        }
    };

    const handleViewMarksReport = (studentId) => {
        window.open(`/studentMarksReport/${studentId}`, "_blank");
    };

    const handleRemoveStudent = async (studentId, name) => {
        if (!confirm(`Remove ${name} from this section?`)) return;

        try {
            // Remove student from section
            await fetch(`${API_URL}/unassignStudentFromSection/${classId}/${sectionId}/${studentId}`, {
                method: "DELETE",
            });

            // Update student grade
            await fetch(`${API_URL}/updateStudentGrade/${studentId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ newGrade: "Unassigned" }),
            });

            // Update local state
            setStudents(prev => prev.filter(s => s._id !== studentId));
            
            // Refresh available students
            const res = await fetch(`${API_URL}/getStudents?grade=Unassigned`);
            const data = await res.json();
            setAvailableStudents(data.data || []);
        } catch (err) {
            console.error("Error removing student:", err);
        }
    };

    const handleChangeTeacher = (subjectId) => {
        setCurrentSubjectForTeacherChange(subjectId);
        setShowChangeTeacherPopup(true);
    };

    const handleConfirmTeacherChange = async () => {
        if (!newTeacherId || !currentSubjectForTeacherChange) return;

        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/updateSubjectTeacher`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    classId,
                    sectionId,
                    subjectId: currentSubjectForTeacherChange,
                    newTeacherId
                })
            });

            if (!response.ok) throw new Error("Failed to update teacher");

            // Optimistic UI update
            setSectionDetails(prev => ({
                ...prev,
                subjects: prev.subjects.map(subject =>
                    subject.subject === currentSubjectForTeacherChange
                        ? { ...subject, teacher: newTeacherId }
                        : subject
                )
            }));

            // Close popup and reset
            setShowChangeTeacherPopup(false);
            setNewTeacherId("");
            setCurrentSubjectForTeacherChange(null);
            alert("Teacher updated successfully!");
        } catch (error) {
            console.error("Error updating teacher:", error);
            alert(error.message || "Failed to update teacher");
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveSubject = async (subjectId) => {
        if (!confirm("Remove this subject from the section?")) return;

        try {
            const response = await fetch(`${API_URL}/removeSubjectFromSection`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ classId, sectionId, subjectId })
            });

            if (!response.ok) throw new Error("Failed to remove subject");

            // Update local state
            setSectionDetails(prev => ({
                ...prev,
                subjects: prev.subjects.filter(s => s.subject !== subjectId)
            }));
            
            alert("Subject removed successfully!");
        } catch (error) {
            console.error("Error removing subject:", error);
            alert(error.message || "Failed to remove subject");
        }
    };

    if (loading || !sectionDetails) return <div className={styles.loadingIndicator}>Loading...</div>;

    return (
        <div className={styles.manageClassContainer}>
            <div className={styles.header}>
                <h2 className={styles.className}>{sectionDetails.sectionName}</h2>
                <div className={styles.actionButtons}>
                    <button className={styles.addButton} onClick={handleAssignRollNumbers}>🔢 Assign Roll Numbers</button>
                    <button className={styles.addButton} onClick={() => setShowAddStudents(true)}>➕ Add Students</button>
                    <button className={styles.addButton} onClick={() => setShowAssignSubjects(true)}>➕ Assign Subjects</button>
                    <button className={styles.addButton} onClick={() => setShowAddTeachers(true)}>✏️ Change Teacher</button>
                </div>
            </div>

            <div className={styles.content}>
                <div className={styles.teacherSection}>
                    <h3>Class Teacher</h3>
                    {teacher ? (
                        <div className={styles.teacherInfo}>
                            <strong>{teacher.name}</strong> ({teacher.staffID})
                        </div>
                    ) : (
                        <p>No teacher assigned.</p>
                    )}

                    <h3>Subject Teachers</h3>
                    {sectionDetails.subjects?.length > 0 ? (
                        <table className={styles.subjectTable}>
                            <thead>
                                <tr>
                                    <th>Subject</th>
                                    <th>Teacher</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sectionDetails.subjects.map((subjectObj) => {
                                    const subject = subjects.find(s => s._id === subjectObj.subject);
                                    const teacher = availableTeachers.find(t => t._id === subjectObj.teacher);
                                    
                                    return (
                                        <tr key={subjectObj.subject}>
                                            <td>{subject?.name || 'Unknown Subject'}</td>
                                            <td>
                                                {teacher 
                                                    ? `${teacher.name} (${teacher.staffID})` 
                                                    : 'No teacher assigned'}
                                            </td>
                                            <td className={styles.actionButtons}>
                                                <button 
                                                    className={styles.changeTeacherButton}
                                                    onClick={() => handleChangeTeacher(subjectObj.subject)}
                                                    disabled={loading}
                                                >
                                                    Change Teacher
                                                </button>
                                                <button 
                                                    className={styles.removeSubjectButton}
                                                    onClick={() => handleRemoveSubject(subjectObj.subject)}
                                                    disabled={loading}
                                                >
                                                    Remove
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    ) : (
                        <p>No subjects assigned.</p>
                    )}
                </div>

                <div className={styles.studentsSection}>
                    <h3>Students ({students.length})</h3>
                    {students.length > 0 ? (
                        <table className={styles.studentTable}>
                            <thead>
                                <tr>
                                    <th>S.No</th>
                                    <th>Roll No</th>
                                    <th>Name</th>
                                    <th>Reg No</th>
                                    <th>Actions</th>
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
                                                onClick={() => handleViewMarksReport(student._id)}
                                            >
                                                🪪 Marks
                                            </button>
                                            <button 
                                                className={styles.deleteButton}
                                                onClick={() => handleRemoveStudent(student._id, student.Student_name)}
                                                disabled={loading}
                                            >
                                                ❌ Remove
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p>No students assigned to this section.</p>
                    )}
                </div>
            </div>

            {/* Add Students Popup */}
            {showAddStudents && (
                <div className={styles.popupOverlay}>
                    <div className={styles.popupContent}>
                        <h3>Add Students ({availableStudents.length} available)</h3>
                        <ul className={styles.availableStudentsList}>
                            {availableStudents.length > 0 ? (
                                availableStudents.map(student => (
                                    <li key={student._id} className={styles.studentItem}>
                                        <label>
                                            <input
                                                type="checkbox"
                                                checked={selectedStudents.includes(student._id)}
                                                onChange={(e) => {
                                                    const { checked } = e.target;
                                                    setSelectedStudents(prev =>
                                                        checked
                                                            ? [...prev, student._id]
                                                            : prev.filter(id => id !== student._id)
                                                    );
                                                }}
                                            />
                                            {student.Student_name} ({student.Registration_number})
                                        </label>
                                    </li>
                                ))
                            ) : (
                                <p>No unassigned students available.</p>
                            )}
                        </ul>
                        <div className={styles.popupButtons}>
                            <button 
                                className={styles.addButton}
                                onClick={handleAddStudents} 
                                disabled={!selectedStudents.length || loading}
                            >
                                {loading ? 'Adding...' : 'Add Selected'}
                            </button>
                            <button 
                                className={styles.cancelButton}
                                onClick={() => setShowAddStudents(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Assign Subjects Popup */}
            {showAssignSubjects && (
                <div className={styles.popupOverlay}>
                    <div className={styles.popupContent}>
                        <h3>Assign Subjects ({unassignedSubjects.length} available)</h3>
                        <div className={styles.subjectList}>
                            {unassignedSubjects.length > 0 ? (
                                unassignedSubjects.map(subject => {
                                    const selected = selectedSubjects.find(s => s.subjectId === subject._id);
                                    return (
                                        <div key={subject._id} className={styles.subjectItem}>
                                            <label>
                                                <input
                                                    type="checkbox"
                                                    checked={!!selected}
                                                    onChange={(e) => {
                                                        const { checked } = e.target;
                                                        setSelectedSubjects(prev =>
                                                            checked
                                                                ? [...prev, { subjectId: subject._id, teacherId: "" }]
                                                                : prev.filter(s => s.subjectId !== subject._id)
                                                        );
                                                    }}
                                                />
                                                {subject.name}
                                            </label>
                                            {selected && (
                                                <select
                                                    className={styles.teacherSelect}
                                                    value={selected.teacherId}
                                                    onChange={(e) => {
                                                        setSelectedSubjects(prev =>
                                                            prev.map(s =>
                                                                s.subjectId === subject._id
                                                                    ? { ...s, teacherId: e.target.value }
                                                                    : s
                                                            )
                                                        );
                                                    }}
                                                >
                                                    <option value="">Select Teacher</option>
                                                    {availableTeachers.map(teacher => (
                                                        <option key={teacher._id} value={teacher._id}>
                                                            {teacher.name} ({teacher.staffID})
                                                        </option>
                                                    ))}
                                                </select>
                                            )}
                                        </div>
                                    );
                                })
                            ) : (
                                <p>All subjects are already assigned.</p>
                            )}
                        </div>
                        <div className={styles.popupButtons}>
                            <button
                                className={styles.addButton}
                                onClick={handleAssignSubjects}
                                disabled={!selectedSubjects.length || loading}
                            >
                                {loading ? 'Assigning...' : 'Assign Subjects'}
                            </button>
                            <button 
                                className={styles.cancelButton}
                                onClick={() => setShowAssignSubjects(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Change Teacher Popup */}
            {showChangeTeacherPopup && (
                <div className={styles.popupOverlay}>
                    <div className={styles.popupContent}>
                        <h3>Change Teacher for Subject</h3>
                        <select
                            className={styles.teacherSelect}
                            value={newTeacherId}
                            onChange={(e) => setNewTeacherId(e.target.value)}
                            disabled={loading}
                        >
                            <option value="">Select Teacher</option>
                            {availableTeachers.map(teacher => (
                                <option key={teacher._id} value={teacher._id}>
                                    {teacher.name} ({teacher.staffID})
                                </option>
                            ))}
                        </select>
                        <div className={styles.popupButtons}>
                            <button
                                className={styles.addButton}
                                onClick={handleConfirmTeacherChange}
                                disabled={!newTeacherId || loading}
                            >
                                {loading ? 'Updating...' : 'Confirm Change'}
                            </button>
                            <button 
                                className={styles.cancelButton}
                                onClick={() => setShowChangeTeacherPopup(false)}
                                disabled={loading}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Assign Class Teacher Popup */}
            {showAddTeachers && (
                <div className={styles.popupOverlay}>
                    <div className={styles.popupContent}>
                        <h3>Assign Class Teacher</h3>
                        <select
                            className={styles.teacherSelect}
                            value={selectedTeacher}
                            onChange={(e) => setSelectedTeacher(e.target.value)}
                        >
                            <option value="">Select Teacher</option>
                            {availableTeachers.map(teacher => (
                                <option key={teacher._id} value={teacher._id}>
                                    {teacher.name} ({teacher.staffID})
                                </option>
                            ))}
                        </select>
                        <div className={styles.popupButtons}>
                            <button
                                className={styles.addButton}
                                onClick={handleAssignTeacher}
                                disabled={!selectedTeacher}
                            >
                                Assign Teacher
                            </button>
                            <button 
                                className={styles.cancelButton}
                                onClick={() => setShowAddTeachers(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Manageclass;