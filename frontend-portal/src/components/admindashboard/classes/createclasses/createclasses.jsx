import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./createclasses.module.css";

const CreateClass = () => {
  const [className, setClassName] = useState("");
  const [gradeLevel, setGradeLevel] = useState("");
  const [sections, setSections] = useState([]);
  const [teacherId, setTeacherId] = useState("");
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  // Fetch all teachers on load
  useEffect(() => {
    fetch(`${API_URL}/getAllTeachers`)
      .then((response) => response.json())
      .then((data) => setTeachers(data))
      .catch((error) => console.error("Error fetching teachers:", error));
  }, []);

  // Add a new section
  const addSection = () => {
    if (!gradeLevel) {
      setMessage("Please select a grade level first.");
      return;
    }

    if (sections.length >= 5) {
      setMessage("Maximum 5 sections allowed.");
      return;
    }

    const nextSection = String.fromCharCode(65 + sections.length); // 'A', 'B', 'C', etc.
    setSections([...sections, nextSection]);
    setMessage("");
  };

  const deleteSection = (index) => {
    setSections(sections.filter((_, i) => i !== index));
  };

  const renameSection = (index, newName) => {
    const updated = [...sections];
    updated[index] = newName.toUpperCase(); // Keep section names uppercase
    setSections(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
  
    try {
      if (!gradeLevel || sections.length === 0) {
        throw new Error("Grade level and at least one section are required.");
      }
  
      const formattedSections = sections.map((sectionName) => ({
        name: sectionName.replace(gradeLevel, ""), // e.g., "2A" → "A"
        gradeLevel: Number(gradeLevel),
        teacherId,
        students: [],
        subjects: [],
      }));
  
      const response = await fetch(`${API_URL}/createClass`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: className,
          sections: formattedSections,
        }),
      });
  
      if (!response.ok) throw new Error("Failed to create class");
  
      const responseData = await response.json();
      setClassName("");
      setGradeLevel("");
      setSections([]);
      setTeacherId("");
      setMessage("Class created successfully!");
  console.log(responseData)
      navigate("/AdminDashboard/ClassManagement/classcards", {
        state: { classId: responseData._id },
      });
    } catch (error) {
      console.error("Error creating class:", error);
      setMessage(error.message || "Error creating class. Try again.");
    }
  
    setLoading(false);
  };
  
  return (
    <div className={styles.container}>
      <h1>📚 Create a New Class</h1>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.inputGroup}>
          <input
            type="text"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            required
            placeholder="Enter Class Name"
          />
        </div>

        <div className={styles.inputGroup}>
          <select
            value={gradeLevel}
            onChange={(e) => {
              setGradeLevel(e.target.value);
              setSections([]);
            }}
            required
          >
            <option value="">Select Grade Level</option>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((grade) => (
              <option key={grade} value={grade}>
                {grade} Grade
              </option>
            ))}
          </select>
        </div>

        <div className={styles.inputGroup}>
          <button type="button" className={styles.addButton} onClick={addSection}>
            ➕ Add Section
          </button>
        </div>

        <div className={styles.sectionsContainer}>
          {sections.map((sec, index) => (
            <div key={index} className={styles.sectionTag}>
              <input
                type="text"
                value={sec}
                onChange={(e) => renameSection(index, e.target.value)}
                className={styles.sectionInput}
              />
              <button
                type="button"
                className={styles.deleteButton}
                onClick={() => deleteSection(index)}
              >
                ❌
              </button>
            </div>
          ))}
        </div>

        <div className={styles.inputGroup}>
          <select
            value={teacherId}
            onChange={(e) => setTeacherId(e.target.value)}
            required
          >
            <option value="">Select a Teacher</option>
            {teachers.length > 0 ? (
              teachers.map((teacher) => (
                <option key={teacher._id} value={teacher._id}>
                  {teacher.name}
                </option>
              ))
            ) : (
              <option disabled>No teachers available</option>
            )}
          </select>
        </div>

        <button type="submit" className={styles.submitButton} disabled={loading}>
          {loading ? "Creating..." : "Create Class"}
        </button>

        {message && (
          <p className={message.includes("Error") ? styles.errorMessage : styles.successMessage}>
            {message}
          </p>
        )}
      </form>
    </div>
  );
};

export default CreateClass;
