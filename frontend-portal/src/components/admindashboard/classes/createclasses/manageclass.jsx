import { useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import styles from "./manageclass.module.css";

const Manageclass = () => {
    const location = useLocation();

    const [selectedClass, setSelectedClass] = useState(null);
    const [students, setStudents] = useState([]); // Students already in the class
    const [teacher, setTeacher] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showAddStudents, setShowAddStudents] = useState(false);
    const [showAddTeachers, setShowAddTeachers] = useState(false);
    const [availableStudents, setAvailableStudents] = useState([]); 
    const [availableTeachers, setAvailableTeachers] = useState([]);
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [selectedTeacher, setSelectedTeacher] = useState(null);

    useEffect(() => {
        const classId = location.state?.classId;

        const fetchClassDetails = async () => {
            try {
                const response = await fetch(`http://localhost:3000/getClassById/${classId}`);
                if (!response.ok) throw new Error("Failed to fetch class details");

                const data = await response.json();
                setSelectedClass(data);

                // Fetch Teacher Details
                if (data.teacherId) {
                    const teacherResponse = await fetch("http://localhost:3000/getTeachersByIds", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ teacherIds: [data.teacherId] }),
                    });

                    if (!teacherResponse.ok) throw new Error("Failed to fetch teacher details");

                    const teacherData = await teacherResponse.json();
                    setTeacher(teacherData);
                }

                // Fetch students currently in the class
                if (data.students?.length > 0) {
                    const studentResponse = await fetch("http://localhost:3000/getStudentsByIds", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ studentIds: data.students }),
                    });

                    if (!studentResponse.ok) throw new Error("Failed to fetch students");

                    const studentData = await studentResponse.json();
                    setStudents(studentData);
                }
            } catch (error) {
                console.error("Error fetching class data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchClassDetails();

        // Fetch all students (excluding those already assigned)
        const fetchStudents = async () => {
            try {
                const response = await fetch("http://localhost:3000/getStudents?grade=Unassigned");
                if (!response.ok) throw new Error("Failed to fetch students");
        
                const studentData = await response.json();
                console.log("Filtered Students API Response:", studentData);
        
                const studentArray = Array.isArray(studentData.data) ? studentData.data : [];
        
                // Remove students already assigned to class
                const assignedStudentIds = students.map((s) => s._id);
                const filteredStudents = studentArray.filter(
                    (student) => !assignedStudentIds.includes(student._id)
                );
        
                setAvailableStudents(filteredStudents);
            } catch (error) {
                console.error("Error fetching students:", error);
            }
        };
        

        fetchStudents();



        const fetchTeachers = async () => {
            try {
                const response = await fetch("http://localhost:3000/getAllTeachers"); // Adjust API endpoint accordingly
                if (!response.ok) throw new Error("Failed to fetch teachers");
        
                const teacherData = await response.json();
                setAvailableTeachers(teacherData);  // Store available teachers in state
            } catch (error) {
                console.error("Error fetching teachers:", error);
            }
        };
        
        fetchTeachers();
        

    }, [location.state]);


    const handleAssignTeacher = async () => {
        if (!selectedTeacher) return;
    
        try {
            const response = await fetch("http://localhost:3000/assignTeacherToClass", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    classId: selectedClass._id,
                    teacherId: selectedTeacher,
                }),
            });
    
            if (!response.ok) throw new Error("Failed to assign teacher");
    
            const updatedClass = await response.json();
            setTeacher(updatedClass.teacherData);  // Update UI with new teacher info
            setShowAddTeachers(false);
        } catch (error) {
            console.error("Error assigning teacher:", error);
        }
    };
    

    // Handle adding students
    const handleAddStudents = async () => {
        if (selectedStudents.length === 0) return;
    
        try {
            // Assign students to the class
            const response = await fetch("http://localhost:3000/assignStudentToClass", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    classId: selectedClass._id,
                    studentIds: selectedStudents,
                }),
            });
    
            if (!response.ok) throw new Error("Failed to add students");
    
            const updatedClass = await response.json();
    
            // Fetch full student details again
            const studentResponse = await fetch("http://localhost:3000/getStudentsByIds", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ studentIds: updatedClass.classData.students }),
            });
    
            if (!studentResponse.ok) throw new Error("Failed to fetch students");
    
            const studentData = await studentResponse.json();
            setStudents(studentData);
    
            // Remove assigned students from availableStudents list
            setAvailableStudents((prev) => prev.filter(student => !selectedStudents.includes(student._id)));
    
            // Update student grade in the database
            await Promise.all(selectedStudents.map(async (studentId) => {
                await fetch(`http://localhost:3000/updateStudentGrade/${studentId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ newGrade: selectedClass.name }), // Update grade
                });
                console.log(selectedClass.name)
            }));
    
            setShowAddStudents(false);
            setSelectedStudents([]);
        } catch (error) {
            console.error("Error adding students:", error);
        }
    };
    
    // Handle removing students
    const handleRemoveStudent = async (studentId,Student_name) => {
      
        if (!confirm(`Are you sure deleting ${Student_name}?    `)) return;

        try {
          
            // Unassign the student from the class
            const response = await fetch(`http://localhost:3000/unassignStudentFromClass/${selectedClass._id}/${studentId}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
            });
    
            if (!response.ok) throw new Error("Failed to remove student");
    
            // Update UI: Remove the student from the current class list
            setStudents(prev => prev.filter(student => student._id !== studentId));
    
            // Fetch details of the removed student using getStudentsByIds
            const studentResponse = await fetch(`http://localhost:3000/getStudentsByIds`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ studentIds: [studentId] }),
            });
    
            if (studentResponse.ok) {
                const studentData = await studentResponse.json();
                if (studentData.length > 0) {
                    setAvailableStudents(prev => [...prev, studentData[0]]);
                }
            } else {
                console.warn(`Student ${studentId} not found in database.`);
            }
    
            // Update student's grade to "Unassigned"
            await fetch(`http://localhost:3000/updateStudentGrade/${studentId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ newGrade: "Unassigned" }),
            });
    
        } catch (error) {
            console.error("Error removing student:", error);
        
        }
      
    };
    
    
    return selectedClass ? (
        <div className={styles.manageClassContainer}>
            {/* Header */}
            <div className={styles.header}>
                <h2 className={styles.className}>{selectedClass.name}</h2><div style={{width:"30%",display:"flex",justifyContent:"space-evenly"}}>
                <button className={styles.addButton} onClick={() => setShowAddStudents(true)}>➕ Add Students</button>
                <button className={styles.addButton} onClick={() => setShowAddTeachers(true)}>➕ Add Teachers</button>
           
                </div> </div>

            {/* Main Content */}
            <div className={styles.content}>
                {/* Teacher Section */}
                <div className={styles.teacherSection}>
                    <h3>Teacher</h3>
                    {loading ? <p>Loading teacher...</p> : teacher ? (
                        <div className={styles.teacherInfo}>
                            <p><strong>{teacher.name}</strong> ({teacher.email})</p>
                        </div>
                    ) : <p>No teacher assigned.</p>}
                </div>

                {/* Students Section */}
                <div className={styles.studentsSection}>
                    <h3>Students</h3>
                    {loading ? <p>Loading students...</p> : students.length > 0 ? (
                        <ul className={styles.studentList}>
                            {students.map((student) => (
                                <li key={student._id} className={styles.studentItem}>
                                    {student.Student_name} ({student.Registration_number})
                                    <button className={styles.deleteButton} onClick={() => handleRemoveStudent(student._id,student.Student_name)}>❌</button>
                                </li>
                            ))}
                        </ul>
                    ) : <p>No students found.</p>}
                </div>
            </div>

            {/* Add Students Popup */}
            {/* Add Students Popup */}
           {/* Add Students Popup */}
{showAddStudents && (
    <div className={styles.popupOverlay}>
        <div className={styles.popupContent}>
            <h3>Select Students to Add</h3>

            {/* Sort students by the numeric part of Registration_number */}
            <ul className={styles.availableStudentsList}>
                {availableStudents.length > 0 ? (
                    [...availableStudents]
                        .sort((a, b) => {
                            const numA = parseInt(a.Registration_number.match(/\d+$/)?.[0] || "0", 10);
                            const numB = parseInt(b.Registration_number.match(/\d+$/)?.[0] || "0", 10);
                            return numA - numB;
                        })
                        .map((student) => (
                            <li key={student._id}>
                                <label>
                                    <input 
                                        type="checkbox" 
                                        value={student._id} 
                                        onChange={(e) => {
                                            const { value, checked } = e.target;
                                            setSelectedStudents((prev) => 
                                                checked 
                                                    ? [...prev, value] 
                                                    : prev.filter((id) => id !== value)
                                            );
                                        }} 
                                    />
                                    {student.Student_name} ({student.Registration_number})
                                </label>
                            </li>
                        ))
                ) : <p>No available students to add.</p>}
            </ul>

            <div className={styles.popupButtons}>
                <button className={styles.addButton} onClick={handleAddStudents}>Add Selected</button>
                <button className={styles.cancelButton} onClick={() => {setShowAddStudents(false)
                    setSelectedStudents([])
                }}>Cancel</button>
            </div>
        </div>
    </div>
)}




{showAddTeachers && (
    <div className={styles.popupOverlay}>
        <div className={styles.popupContent}>
            <h3>Select Teacher to Assign</h3>
            <ul className={styles.availableTeachersList}>
                {availableTeachers.length > 0 ? (
                    availableTeachers.map((teacher) => (
                        <li key={teacher._id}>
                            <label>
                                <input 
                                    type="radio" 
                                    name="selectedTeacher"
                                    value={teacher._id} 
                                    onChange={(e) => setSelectedTeacher(e.target.value)} // ✅ FIXED
                                />
                                {teacher.name} ({teacher.email})
                            </label>
                        </li>
                    ))
                ) : <p>No available teachers to assign.</p>}
            </ul>
            <div className={styles.popupButtons}>
                <button className={styles.addButton} onClick={handleAssignTeacher}>Assign Teacher</button>
                <button className={styles.cancelButton} onClick={() => setShowAddTeachers(false)}>Cancel</button>
            </div>
        </div>
    </div>
)}



        </div>
    ) : null;
};

export default Manageclass;
