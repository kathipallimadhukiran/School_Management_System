import React, { useState, useEffect } from "react";
import axios from "axios";

const ClassManagement = () => {
  const [classes, setClasses] = useState([]);
  const [formData, setFormData] = useState({
    class_name: "",
    class_teacher: "",
    class_students: "",
    class_subjects: "",
    subject_marks: "",
  });

  useEffect(() => {
    fetchClasses();
  }, []);

  // Fetch existing classes from backend
  const fetchClasses = async () => {
    try {
      const response = await axios.get("http://localhost:5000/Get_classes");
      setClasses(response.data);
    } catch (error) {
      console.error("Error fetching classes:", error);
    }
  };

  // Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Submit class data to backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/add-class", {
        ...formData,
        class_students: formData.class_students.split(","),
        class_subjects: formData.class_subjects.split(","),
        subject_marks: formData.subject_marks.split(","),
      });
      fetchClasses(); // Refresh class list
      alert("Class added successfully!");
      setFormData({
        class_name: "",
        class_teacher: "",
        class_students: "",
        class_subjects: "",
        subject_marks: "",
      });
    } catch (error) {
      console.error("Error adding class:", error);
      alert("Failed to add class");
    }
  };

  // Update class subjects and marks
  const updateClass = async (id, updatedData) => {
    try {
      await axios.put(`http://localhost:5000/api/update-class/${id}`, updatedData);
      fetchClasses();
      alert("Class updated successfully!");
    } catch (error) {
      console.error("Error updating class:", error);
    }
  };

  // Delete class
  const deleteClass = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/delete-class/${id}`);
      fetchClasses();
      alert("Class deleted successfully!");
    } catch (error) {
      console.error("Error deleting class:", error);
    }
  };

  return (
    <div>
      <h2>Class Management</h2>

      {/* Class Form */}
      <form onSubmit={handleSubmit}>
        <input type="text" name="class_name" placeholder="Class Name" value={formData.class_name} onChange={handleChange} required />
        <input type="text" name="class_teacher" placeholder="Class Teacher" value={formData.class_teacher} onChange={handleChange} required />
        <input type="text" name="class_students" placeholder="Students (comma-separated)" value={formData.class_students} onChange={handleChange} required />
        <input type="text" name="class_subjects" placeholder="Subjects (comma-separated)" value={formData.class_subjects} onChange={handleChange} required />
        <input type="text" name="subject_marks" placeholder="Marks (comma-separated)" value={formData.subject_marks} onChange={handleChange} />
        <button type="submit">Add Class</button>
      </form>

      {/* Class List */}
      <h3>Existing Classes</h3>
      <ul>
        {classes.map((cls) => (
          <li key={cls._id}>
            <strong>{cls.class_name}</strong> - Teacher: {cls.class_teacher}
            <br />
            Students: {cls.class_students.join(", ")}
            <br />
            Subjects: {cls.class_subjects.join(", ")}
            <br />
            Marks: {cls.subject_marks.join(", ")}
            <br />
            <button onClick={() => updateClass(cls._id, { class_subjects: ["Math", "English"], subject_marks: [80, 90] })}>Update</button>
            <button onClick={() => deleteClass(cls._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ClassManagement;
