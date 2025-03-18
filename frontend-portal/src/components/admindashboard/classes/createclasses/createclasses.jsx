import { useState, useEffect } from "react";
import styles from "./createclasses.module.css";

const CreateClass = () => {
  const [className, setClassName] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Fetch all teachers on component mount
  useEffect(() => {
    fetch("http://localhost:3000/getAllTeachers")
      .then((response) => response.json())
      .then((data) => setTeachers(data))
      .catch((error) => console.error("Error fetching teachers:", error));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("http://localhost:3000/createClass", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: className, teacherId }),
      });

      if (!response.ok) throw new Error("Failed to create class");

      setClassName("");
      setTeacherId("");
      setMessage("Class created successfully!");
    } catch (error) {
      console.error("Error creating class:", error);
      setMessage("Error creating class. Try again.");
    }

    setLoading(false);
  };

  return (
    <div className={styles.container}>
      <h1>📚 Create a New Class</h1>
      <form className={styles.form} onSubmit={handleSubmit}>
        {/* Class Name Input */}
        <div className={styles.inputGroup}>
          <input
            type="text"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            required
            placeholder="Enter Class Name"
          />
        </div>

        {/* Teacher Selection */}
        <div className={styles.inputGroup}>
          <select
            value={teacherId}
            onChange={(e) => setTeacherId(e.target.value)}
            required
          >
            <option value="">Select a Teacher</option>
            {teachers.map((teacher) => (
              <option key={teacher._id} value={teacher._id}>
                {teacher.name}
              </option>
            ))}
          </select>
        </div>

        {/* Submit Button */}
        <button type="submit" className={styles.submitButton} disabled={loading}>
          {loading ? "Creating..." : "Create Class"}
        </button>

        {/* Success/Error Message */}
        {message && <p className={styles.message}>{message}</p>}
      </form>
    </div>
  );
};

export default CreateClass;
