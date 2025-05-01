import { useEffect, useState } from "react";
import styles from "./TeachersList.module.css"; // Import CSS module
import axios from 'axios';

const TeachersList = () => {
    const [availableTeachers, setAvailableTeachers] = useState([]);
    const [availablesubjects, setAvailablesubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [update_popup, setupdate_popup] = useState(false);
    const [error, setError] = useState(null);
    const [selectedTeacher, setSelectedTeacher] = useState(null);

    const API_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const fetchTeachers = async () => {
            try {
                const response = await fetch(`${API_URL}/getAllTeachers`);
                if (!response.ok) throw new Error("Failed to fetch teachers");

                const teacherData = await response.json();
                console.log(teacherData); // Check if profileImage is correct
                setAvailableTeachers(teacherData);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };


        const fetchSubjects = async () => {
            try {
                const response = await fetch(`${API_URL}/getAllSubjects`);
                if (!response.ok) throw new Error("Failed to fetch Subjects");

                const subjectdata = await response.json();
                setAvailablesubjects(subjectdata);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchTeachers();
        fetchSubjects();
    }, []);

    const getFullImageUrl = (relativePath) => {
        if (relativePath) {
            return `${API_URL}${relativePath}`;
        }
        return ""; // Return an empty string if no profile image
    };

    const getSubjectNames = (subjectIds) => {
        if (!Array.isArray(subjectIds)) return "No subjects"; // Check if subjectIds is an array
        const subjectNames = subjectIds
            .map((id) => {
                const subject = availablesubjects.find((sub) => sub._id === id);
                return subject ? subject.name : null;
            })
            .filter((name) => name); // Remove any null values
        return subjectNames.length ? subjectNames.join(', ') : "No subjects";
    };

    const handleDelete = async (teacherId) => {
        const confirmDelete = window.confirm(`Are you sure you want to delete teacher with ID: ${teacherId}?`);
        if (!confirmDelete) return;

        try {
            const response = await axios.delete(`${API_URL}/delete_staff/${teacherId}`);
            if (response.status === 200) {
                alert("Teacher deleted successfully!");
                setAvailableTeachers(prev => prev.filter(t => t._id !== teacherId));
            } else {
                alert(response.data.message || "Failed to delete teacher.");
            }
        } catch (error) {
            console.error("Error deleting teacher:", error);
            alert(error.response?.data?.message || "An error occurred while deleting the teacher.");
        }
    };

    const handleUpdate = (teacher) => {
        setSelectedTeacher(teacher);
        setupdate_popup(true);
    };

    const handleUpdateChange = (e) => {
        const { name, value } = e.target;
        setSelectedTeacher((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubjectChange = (e, subjectId) => {
        const isChecked = e.target.checked;
        setSelectedTeacher((prev) => {
            const updatedSubjects = isChecked
                ? [...prev.subjectSpecialization, subjectId]
                : prev.subjectSpecialization.filter((id) => id !== subjectId);
            return { ...prev, subjectSpecialization: updatedSubjects };
        });
    };

    const handleUpdateSubmit = async (e) => {
        e.preventDefault();
        try {
            const { _id, name, email, password, joiningDate, ClassTeacher, profileImage, ...updatableFields } = selectedTeacher;
            const response = await axios.put(`${API_URL}/update_teacher/${_id}`, updatableFields);

            if (response.status === 200) {
                alert("Teacher updated successfully!");

                setAvailableTeachers((prev) =>
                    prev.map((t) => (t._id === _id ? response.data : t))
                );

                setupdate_popup(false);
            } else {
                alert("Failed to update teacher");
            }
        } catch (error) {
            console.error("Update error:", error);
            alert("An error occurred while updating teacher");
        }
    };

    return (
        <div className={styles.container}>
            <h2 className={styles.heading}>All Teachers</h2>
            {loading && <p className={styles.loading}>Loading...</p>}
{error && <p className={styles.error}>Error: {error}</p>}

{!loading && !error && (
    availableTeachers.length > 0 ? (
        <table className={styles.table}>
            <thead>
                <tr>
                    <th>S. No.</th>
                    <th>Image</th>
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
                        <td>
                            {teacher.profileImage ? (
                                <img
                                    src={getFullImageUrl(teacher.profileImage)}
                                    alt="Profile"
                                    className={styles.profileImage}
                                />
                            ) : (
                                "No Image"
                            )}
                        </td>
                        <td>{teacher.staffID}</td>
                        <td>{teacher.name}</td>
                        <td>{teacher.email}</td>
                        <td>{teacher.phone}</td>
                        <td>{getSubjectNames(teacher.subjectSpecialization || [])}</td>
                        <td className={styles.actions}>
                            <button className={styles.delete} onClick={() => handleDelete(teacher._id)}>Delete</button>
                            <button className={styles.update} onClick={() => handleUpdate(teacher)}>Update</button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    ) : (
        <p className={styles.noData}>No teachers found.</p>
    )
)}


            {/* Update Popup */}
            {update_popup && selectedTeacher && (
                <div className={styles.popup}>
                    <div className={styles.popupContent}>
                        <h3>Edit Teacher</h3>
                        <form onSubmit={handleUpdateSubmit}>
                            {selectedTeacher.profileImage && (
                                <div className={styles.imagePreview}>
                                    <p>Current Profile Image:</p>
                                    <img
                                        src={getFullImageUrl(selectedTeacher.profileImage)}
                                        alt="Profile Preview"
                                        className={styles.profileImage}
                                    />
                                </div>
                            )}


                            <label>
                                Phone:
                                <input
                                    type="text"
                                    name="phone"
                                    value={selectedTeacher.phone}
                                    onChange={handleUpdateChange}
                                />
                            </label>
                            <label>
                                Gender:
                                <select
                                    name="gender"
                                    value={selectedTeacher.gender}
                                    onChange={handleUpdateChange}
                                >
                                    <option value="">Select</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </label>
                            <label>
                                Date of Birth:
                                <input
                                    type="date"
                                    name="dob"
                                    value={selectedTeacher.dob?.split('T')[0]}
                                    onChange={handleUpdateChange}
                                />
                            </label>
                            <label>
                                Address:
                                <textarea
                                    name="address"
                                    value={selectedTeacher.address}
                                    onChange={handleUpdateChange}
                                />
                            </label>
                            <label>
                                Subject Specialization:
                                <select
                                    name="subjectSpecialization"
                                    multiple
                                    value={selectedTeacher.subjectSpecialization || []}
                                    onChange={(e) => {
                                        const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
                                        setSelectedTeacher((prev) => ({
                                            ...prev,
                                            subjectSpecialization: selectedOptions,
                                        }));
                                    }}
                                    className={styles.multiSelect}
                                >
                                    {availablesubjects.map((subject) => (
                                        <option key={subject._id} value={subject._id}>
                                            {subject.name}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label>
                                Experience (in years):
                                <input
                                    type="number"
                                    name="experience"
                                    value={selectedTeacher.experience}
                                    onChange={handleUpdateChange}
                                />
                            </label>
                            <label>
                                Salary:
                                <input
                                    type="number"
                                    name="salary"
                                    value={selectedTeacher.salary}
                                    onChange={handleUpdateChange}
                                />
                            </label>

                            <div className={styles.popupActions}>
                                <button type="submit">Save</button>
                                <button type="button" onClick={() => setupdate_popup(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeachersList;
