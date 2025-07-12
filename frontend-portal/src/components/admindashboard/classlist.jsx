import { useEffect, useState } from "react";
import styles from "./classlist.module.css"; // Import CSS module

const ClassList = () => {
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedClass, setExpandedClass] = useState(null);
    const API_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const response = await fetch(`${API_URL}/getAllClass`);
                if (!response.ok) throw new Error("Failed to fetch classes");

                const classData = await response.json();
                setClasses(classData);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchClasses();
    }, []);

    const toggleExpandClass = (classId) => {
        setExpandedClass(expandedClass === classId ? null : classId);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this class?")) {
            try {
                const response = await fetch(`${API_URL}/deleteClass/${id}`, {
                    method: "DELETE",
                });

                if (!response.ok) throw new Error("Failed to delete class");

                setClasses(classes.filter((cls) => cls._id !== id));
                alert("Class deleted successfully");
            } catch (error) {
                alert(`Error deleting class: ${error.message}`);
            }
        }
    };

    const handleUpdate = (id) => {
        alert(`Update details for class ID: ${id}`);
    };

    const handleViewStudents = (id) => {
        alert(`View students of class ID: ${id}`);
    };

    const handleViewSectionStudents = (classId, sectionName) => {
        alert(`Viewing students for Section ${sectionName} of Class ID ${classId}`);
    };

    const handleUpdateSection = (classId, sectionName) => {
        alert(`Updating Section ${sectionName} of Class ID ${classId}`);
    };

    const handleDeleteSection = async (classId, sectionName) => {
        if (window.confirm(`Delete Section ${sectionName} from Class ID ${classId}?`)) {
            try {
                const response = await fetch(`${API_URL}/deleteSection/${classId}/${sectionName}`, {
                    method: "DELETE",
                });
                if (!response.ok) throw new Error("Failed to delete section");

                setClasses(prev =>
                    prev.map(cls => {
                        if (cls._id === classId) {
                            return {
                                ...cls,
                                sections: cls.sections.filter(sec => sec.name !== sectionName)
                            };
                        }
                        return cls;
                    })
                );
                alert("Section deleted successfully");
            } catch (error) {
                alert(`Error deleting section: ${error.message}`);
            }
        }
    };

    return (
        <div className={styles.container}>
            <h2 className={styles.heading}>Class Management</h2>
            <div className={styles.controls}>
                <button className={styles.addButton}>Add New Class</button>
            </div>

            {loading && <div className={styles.loader}></div>}
            {error && <div className={styles.error}>{error}</div>}

            {!loading && !error && (
                <div className={styles.classesContainer}>
                    {classes.length > 0 ? (
                        classes.map((cls) => (
                            <div key={cls._id} className={styles.classCard}>
                                <div
                                    className={styles.classHeader}
                                    onClick={() => toggleExpandClass(cls._id)}
                                >
                                    <div className={styles.classInfo}>
                                        <span className={styles.classId}>#{cls.classID}</span>
                                        <h3 className={styles.className}>{cls.name}</h3>
                                        <span className={styles.gradeLevel}>Grade {cls.gradeLevel}</span>
                                    </div>
                                    <div className={styles.classStats}>
                                        <span>{cls.sections.length} Sections</span>
                                        <span>{cls.sections.reduce((acc, sec) => acc + (sec.students?.length || 0), 0)} Students</span>
                                    </div>
                                    <div className={styles.classActions}>
                                    
                                        <button
                                            className={`${styles.actionButton} ${styles.editButton}`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleUpdate(cls._id);
                                            }}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className={`${styles.actionButton} ${styles.deleteButton}`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(cls._id);
                                            }}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                    <div className={styles.expandIcon}>
                                        {expandedClass === cls._id ?  <button
                                                        className={`${styles.actionButton} ${styles.viewButton}`}
                                                        onClick={() => handleViewSectionStudents(cls._id, sec.name)}
                                                    >
                                                        View Close
                                                    </button> :  <button
                                                        className={`${styles.actionButton} ${styles.viewButton}`}
                                                        onClick={() => handleViewSectionStudents(cls._id, sec.name)}
                                                    >
                                                        View All
                                                    </button>}
                                    </div>
                                </div>

                                {expandedClass === cls._id && (
                                    <div className={styles.sectionsContainer}>
                                        {cls.sections.map((sec) => (
                                            <div key={`${cls._id}-${sec.name}`} className={styles.sectionCard}>
                                                <div className={styles.sectionInfo}>
                                                    <h4 className={styles.sectionName}>Section {sec.name}</h4>
                                                    <div className={styles.sectionDetails}>
                                                        <span>Students: {sec.students?.length || 0}</span>
                                                        <span>Teacher: {cls.teacher?.name || "Not assigned"}</span>
                                                    </div>
                                                </div>
                                                <div className={styles.sectionActions}>
                                                <button
                                                        className={`${styles.actionButton} ${styles.viewButton}`}
                                                        onClick={() => handleViewSectionStudents(cls._id, sec.name)}
                                                    >
                                                        View
                                                    </button>
                                                    <button
                                                        className={`${styles.actionButton} ${styles.editButton}`}
                                                        onClick={() => handleUpdateSection(cls._id, sec.name)}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        className={`${styles.actionButton} ${styles.deleteButton}`}
                                                        onClick={() => handleDeleteSection(cls._id, sec.name)}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className={styles.emptyState}>
                            <p>No classes found.</p>
                            <button className={styles.addButton}>Add New Class</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ClassList;
