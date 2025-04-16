import { useEffect, useState } from "react";
import styles from "./TeachersList.module.css"; // Import CSS module

const TeachersList = () => {
    const [availableTeachers, setAvailableTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const API_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const fetchTeachers = async () => {
            try {
                const response = await fetch(`${API_URL}/getAllTeachers`);
                if (!response.ok) throw new Error("Failed to fetch teachers");

                const teacherData = await response.json();
                setAvailableTeachers(teacherData);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchTeachers();
    }, []);

    // Handle delete
    const handleDelete = (id) => {
        alert(`Delete teacher with ID: ${id}`);
    };

    // Handle pay salary
    const handlePaySalary = (id) => {
        alert(`Pay salary for teacher ID: ${id}`);
    };

    // Handle update
    const handleUpdate = (id) => {
        alert(`Update details for teacher ID: ${id}`);
    };

    // Handle send notification
    const handleSendNotification = (id) => {
        alert(`Send notification to teacher ID: ${id}`);
    };

    return (
        <div className={styles.container}>
            <h2 className={styles.heading}>All Teachers</h2>

            {loading && <p className={styles.loading}>Loading...</p>}
            {error && <p className={styles.error}>Error: {error}</p>}

            {!loading && !error && availableTeachers.length > 0 ? (
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>S. No.</th>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Subject</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {availableTeachers.map((teacher, index) => (
                            <tr key={teacher._id}>
                                <td>{index + 1}</td>
                                <td>{teacher.staffID}</td>
                                <td>{teacher.name}</td>
                                <td>{teacher.email}</td>
                                <td>{teacher.phone}</td>
                                <td>{teacher.subjectSpecialization}</td>
                                <td className={styles.actions}>
                                    <button className={styles.delete} onClick={() => handleDelete(teacher._id)}>Delete</button>
                                    <button className={styles.pay} onClick={() => handlePaySalary(teacher._id)}>Pay Salary</button>
                                    <button className={styles.update} onClick={() => handleUpdate(teacher._id)}>Update</button>
                                    <button className={styles.notify} onClick={() => handleSendNotification(teacher._id)}>Notify</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                !loading && <p className={styles.noData}>No teachers found.</p>
            )}
        </div>
    );
};

export default TeachersList;
