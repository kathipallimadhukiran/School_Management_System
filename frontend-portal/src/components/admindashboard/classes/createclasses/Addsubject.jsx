import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Addsubject.module.css"; // ✅ Import CSS Module

const AddSubject = () => {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  const [subjectData, setSubjectData] = useState({ name: "", code: "" });
  const [subjects, setSubjects] = useState([]); // ✅ Store subjects from backend
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

    useEffect(() => {
      const fetchSubjects = async () => {
        try {
          const response = await fetch(`${API_URL}/getAllSubjects`);
  
          if (!response.ok) {
            throw new Error(`Failed to fetch subjects. Status: ${response.status}`);
          }
  
          const data = await response.json();
  
          if (Array.isArray(data)) {
            setSubjects(data); // ✅ Ensure 'data' is an array
          } else if (data.subjects && Array.isArray(data.subjects)) {
            setSubjects(data.subjects); // ✅ If API returns { subjects: [...] }
          } else {
            throw new Error("Invalid subjects data format");
          }
        } catch (err) {
          console.error("Error fetching subjects:", err);
        }
      };
  
      fetchSubjects();
    }, []);

  // Handle Input Changes
  const handleChange = (e) => {
    setSubjectData({ ...subjectData, [e.target.name]: e.target.value });
  };

  // Handle Subject Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    if (!subjectData.name || !subjectData.code) {
      setError("Please fill in all fields.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/addSubject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subjectData),
      });

      const result = await response.json();
      setLoading(false);

      if (response.ok) {
        setMessage("Subject added successfully!");
        setSubjects([...subjects, result.subject]); // ✅ Update subject list
        setSubjectData({ name: "", code: "" });
      } else {
        setError(result.message || "Failed to add subject.");
      }
    } catch (err) {
      console.error("Error adding subject:", err);
      setError("Server error. Please try again.");
      setLoading(false);
    }
  };

  // ✅ Handle subject selection for deletion
  const handleSelectSubject = (subject) => {
    setSelectedSubject(subject);
  };

  // ✅ Handle subject deletion WITHOUT password
  const handleDeleteSubject = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedSubject.name}?`)) return;

    try {
        const response = await fetch(`${API_URL}/deleteSubject/${selectedSubject._id}`, {
            method: "DELETE",
          });
          

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Failed to delete subject");

      setSubjects((prevSubjects) => prevSubjects.filter((s) => s._id !== selectedSubject._id));
      setSelectedSubject(null);
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className={styles.addSubjectContainer}>
      <h1>Add Subject</h1>
      <form onSubmit={handleSubmit} className={styles.subjectForm}>
        <div className={styles.inputs}>
          <input
            type="text"
            name="name"
            placeholder="Subject Name"
            value={subjectData.name}
            onChange={handleChange}
            className={styles.inputField}
          />
          <input
            type="text"
            name="code"
            placeholder="Subject Code"
            value={subjectData.code}
            onChange={handleChange}
            className={styles.inputField}
          />
        </div>

        {/* Error & Success Messages */}
        {error && <p className={styles.errorMessage}>{error}</p>}
        {message && <p className={styles.successMessage}>{message}</p>}

        <div className={styles.buttonContainer}>
          <button type="submit" disabled={loading} className={styles.submitBtn}>
            {loading ? "Adding..." : "Add Subject"}
          </button>
          <button type="button" onClick={() => navigate(-1)} className={styles.cancelBtn}>
            Cancel
          </button>
        </div>
      </form>

      {/* ✅ Display Existing Subjects */}
      <h2>Existing Subjects</h2>
      {subjects.length === 0 ? (
        <p>No subjects available.</p>
      ) : (
        <table className={styles.subjectTable}>
          <thead>
            <tr>
              <th>Subject Name</th>
              <th>Subject Code</th>
              <th>Teachers</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map((subject) => (
              <tr key={subject._id}>
                <td>{subject.name}</td>
                <td>{subject.code}</td>
                <td>
                  {subject.teachers && subject.teachers.length > 0
                    ? subject.teachers.map((teacher) => teacher.name).join(", ")
                    : "No teachers assigned"}
                </td>
                <td>
                  <button
                    className={styles.deleteBtn}
                    onClick={() => handleSelectSubject(subject)}
                  >
                    ❌ Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* ✅ Modal for Deleting Subject */}
      {selectedSubject && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2>Delete Subject</h2>
            <p>Are you sure you want to delete "{selectedSubject.name}"?</p>

            {error && <p className={styles.error}>{error}</p>}

            <div className={styles.modalButtons}>
              <button className={styles.deleteButton} onClick={handleDeleteSubject}>
                ❌ Confirm Delete
              </button>
              <button className={styles.cancelButton} onClick={() => setSelectedSubject(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddSubject;
