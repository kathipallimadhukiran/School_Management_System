import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./addStaff.module.css";

const AddStaff = () => {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "Staff",
    phone: "",
    gender: "",
    dob: "",
    address: "",
    subjectSpecialization: [],
    experience: "",
    salary: "",
    joiningDate: "",
    department: "",
  });

  const [subjects, setSubjects] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await fetch(`${API_URL}/getAllSubjects`);
        const data = await response.json();
        if (Array.isArray(data)) setSubjects(data);
        else if (data.subjects && Array.isArray(data.subjects)) setSubjects(data.subjects);
        else throw new Error("Invalid subjects data format");
      } catch (err) {
        console.error("Error fetching subjects:", err);
      }
    };
    fetchSubjects();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e, id) => {
    const selected = [...formData.subjectSpecialization];
    if (e.target.checked) {
      selected.push(id);
    } else {
      const index = selected.indexOf(id);
      if (index !== -1) selected.splice(index, 1);
    }
    setFormData({ ...formData, subjectSpecialization: selected });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    const requiredFields = ["name", "email", "role"];
    if (formData.role === "Teacher") {
      requiredFields.push(
        "phone",
        "gender",
        "dob",
        "address",
        "subjectSpecialization",
        "experience",
        "salary",
        "joiningDate",
        "department"
      );
    }

    for (let field of requiredFields) {
      if (
        !formData[field] ||
        (Array.isArray(formData[field]) && formData[field].length === 0)
      ) {
        setError("Please fill in all required fields.");
        setLoading(false);
        return;
      }
    }

    try {
      const response = await fetch(`${API_URL}/Signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      setLoading(false);

      if (response.ok) {
        setMessage(`${formData.role} added successfully!`);
        setFormData({
          name: "",
          email: "",
          role: "Staff",
          phone: "",
          gender: "",
          dob: "",
          address: "",
          subjectSpecialization: [],
          experience: "",
          salary: "",
          joiningDate: "",
          department: "",
        });
      } else {
        setError(result.message || "Signup failed!");
      }
    } catch (err) {
      console.error("Error during signup:", err);
      setError("Server error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className={styles.addStaffContainer}>
      <h2>Add New User</h2>
      <form onSubmit={handleSignup}>
        {/* Name & Email */}
        <div className={styles.inputRow}>
          <div className={styles.inputGroup}>
            <label>Name *</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} />
          </div>
          <div className={styles.inputGroup}>
            <label>Email *</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} />
          </div>
        </div>

        {/* Role & Phone */}
        <div className={styles.inputRow}>
          <div className={styles.inputGroup}>
            <label>Role *</label>
            <select name="role" value={formData.role} onChange={handleChange}>
              <option value="Staff">Staff</option>
              <option value="Admin">Admin</option>
              <option value="Teacher">Teacher</option>
            </select>
          </div>
          <div className={styles.inputGroup}>
            <label>Phone *</label>
            <input type="text" name="phone" value={formData.phone} onChange={handleChange} />
          </div>
        </div>

        {/* Gender & DOB */}
        <div className={styles.inputRow}>
          <div className={styles.inputGroup}>
            <label>Gender *</label>
            <select name="gender" value={formData.gender} onChange={handleChange}>
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
          <div className={styles.inputGroup}>
            <label>Date of Birth *</label>
            <input type="date" name="dob" value={formData.dob} onChange={handleChange} />
          </div>
        </div>

        {/* Address */}
        <div className={styles.inputRow}>
          <div className={styles.inputGroup}>
            <label>Address *</label>
            <input type="text" name="address" value={formData.address} onChange={handleChange} />
          </div>
        </div>

        {/* Subject Specialization */}
        {formData.role === "Teacher" && (
          <div className={styles.inputRow}>
            <div className={styles.inputGroup}>
              <label>Subject Specialization *</label>
              <div className={styles.checkboxContainer}>
                {subjects.map((subject) => (
                  <label key={subject._id} className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      value={subject._id}
                      checked={formData.subjectSpecialization.includes(subject._id)}
                      onChange={(e) => handleCheckboxChange(e, subject._id)}
                    />
                    {subject.name}
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Experience & Salary */}
        <div className={styles.inputRow}>
          <div className={styles.inputGroup}>
            <label>Experience (Years) *</label>
            <input
              type="number"
              name="experience"
              value={formData.experience}
              onChange={handleChange}
            />
          </div>
          <div className={styles.inputGroup}>
            <label>Salary *</label>
            <input
              type="number"
              name="salary"
              value={formData.salary}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Joining Date & Department */}
        <div className={styles.inputRow}>
          <div className={styles.inputGroup}>
            <label>Joining Date *</label>
            <input
              type="date"
              name="joiningDate"
              value={formData.joiningDate}
              onChange={handleChange}
            />
          </div>
          <div className={styles.inputGroup}>
            <label>Department *</label>
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleChange}
            />
          </div>
        </div>

        {error && <p className={styles.errorMessage}>{error}</p>}
        {message && <p className={styles.successMessage}>{message}</p>}

        <div className={styles.buttonContainer}>
          <button type="submit" className={styles.addStaffBtn} disabled={loading}>
            {loading ? "Adding..." : `Add ${formData.role}`}
          </button>
          <button type="button" className={styles.cancelBtn} onClick={() => navigate(-1)}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddStaff;
