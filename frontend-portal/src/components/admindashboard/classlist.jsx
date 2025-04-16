import { useEffect, useState } from "react";
import styles from "./classlist.module.css"; // Import CSS module

const ClassList = () => {
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const API_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const response = await fetch(`${API_URL}/getAllClass`); // Updated API endpoint
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

    // Handle delete
    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this class?")) {
            try {
                const response = await fetch(`${API_URL}/deleteClass/${id}`, {
                    method: "DELETE",
                });

                if (!response.ok) throw new Error("Failed to delete class");

                setClasses(classes.filter((cls) => cls._id !== id)); // Remove class from state
                alert("Class deleted successfully");
            } catch (error) {
                alert(`Error deleting class: ${error.message}`);
            }
        }
    };

    // Handle update
    const handleUpdate = (id) => {
        alert(`Update details for class ID: ${id}`);
        // Implement update logic (e.g., navigate to update form)
    };

    // Handle view students
    const handleViewStudents = (id) => {
        alert(`View students of class ID: ${id}`);
        // Implement navigation to student list of the class
    };

    return (
        <div className={styles.container}>
            <h2 className={styles.heading}>All Classes</h2>

            {loading && <p className={styles.loading}>Loading...</p>}
            {error && <p className={styles.error}>Error: {error}</p>}

            {!loading && !error && classes.length > 0 ? (
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>S. No.</th>
                            <th>Class ID</th>
                            <th>Class Name</th>
                            <th>Section</th>
                            <th>Grade Level</th>
                            <th>Teacher</th>
                            <th>Total Students</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {classes.map((cls, index) => (
                            <tr key={cls._id}>
                                <td>{index + 1}</td>
                                <td>{cls.classID}</td>
                                <td>{cls.name}</td>
                                <td>{cls.section}</td>
                                <td>{cls.gradeLevel}</td>
                                <td>{cls.teacher?.name || "N/A"}</td>
                                <td>{cls.students?.length || 0}</td>
                                <td className={styles.actions}>
                                    <button className={styles.delete} onClick={() => handleDelete(cls._id)}>Delete</button>
                                    <button className={styles.update} onClick={() => handleUpdate(cls._id)}>Update</button>
                                    <button className={styles.view} onClick={() => handleViewStudents(cls._id)}>View Students</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                !loading && <p className={styles.noData}>No classes found.</p>
            )}
        </div>
    );
};

export default ClassList;
