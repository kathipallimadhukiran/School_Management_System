import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./addStaff.module.css"; // Import CSS Module

const API_URL = "http://localhost:3000";

const AddStaff = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");
  const [dob, setDob] = useState("");
  const [address, setAddress] = useState("");
  const [nationality, setNationality] = useState("");
  const [subjectSpecialization, setSubjectSpecialization] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [employmentType, setEmploymentType] = useState("");
  const [experience, setExperience] = useState("");
  const [salary, setSalary] = useState("");
  const [joiningDate, setJoiningDate] = useState("");
  const [department, setDepartment] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await fetch(`${API_URL}/getAllSubjects`);
        if (!response.ok) throw new Error("Failed to fetch subjects");
        const result = await response.json();
        setSubjects(result);
      } catch (error) {
        console.error("Error fetching subjects:", error);
      }
    };

    fetchSubjects();
  }, []);

  const handleCheckboxChange = (subjectName) => {
    setSubjectSpecialization((prev) =>
      prev.includes(subjectName)
        ? prev.filter((s) => s !== subjectName)
        : [...prev, subjectName]
    );
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!name || !email || !password || !phone || !gender || !dob || !address || !nationality || 
        subjectSpecialization.length === 0 || !employmentType || !experience || !salary || 
        !joiningDate || !department) {
      setError("Please fill all required fields.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/Signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          phone,
          gender,
          dob,
          address,
          nationality,
          subjectSpecialization,
          employmentType,
          experience,
          salary,
          joiningDate,
          department,
          role: "Teacher",
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage("Teacher added successfully!");
      } else {
        setError(result.message || "Signup failed!");
      }
    } catch (err) {
      setError("Server error. Please try again.");
    }
  };

  return (
    <div className={styles.addStaffContainer}>
      <h2>Add New Teacher</h2>
      <form onSubmit={handleSignup}>
        
        <div className={styles.inputRow}>
          <div className={styles.inputGroup}>
            <label>Name</label>
            <input type="text" placeholder="Enter name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className={styles.inputGroup}>
            <label>Email</label>
            <input type="email" placeholder="Enter email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
        </div>

        <div className={styles.inputRow}>
          <div className={styles.inputGroup}>
            <label>Password</label>
            <input type="password" placeholder="Enter password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div className={styles.inputGroup}>
            <label>Phone</label>
            <input type="text" placeholder="Enter phone number" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
        </div>

        <div className={styles.inputRow}>
          <div className={styles.inputGroup}>
            <label>Gender</label>
            <select value={gender} onChange={(e) => setGender(e.target.value)}>
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className={styles.inputGroup}>
            <label>Date of Birth</label>
            <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
          </div>
        </div>

        <div className={styles.inputRow}>
          <div className={styles.inputGroup}>
            <label>Address</label>
            <input type="text" placeholder="Enter address" value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>
          <div className={styles.inputGroup}>
            <label>Nationality</label>
            <input type="text" placeholder="Enter nationality" value={nationality} onChange={(e) => setNationality(e.target.value)} />
          </div>
        </div>

        <div className={styles.inputGroup}>
          <label>Subject Specialization</label>
          <div className={styles.checkboxContainer}>
            {subjects.map((subject) => (
              <label key={subject._id} className={styles.checkboxLabel}>
                <input type="checkbox" value={subject.name} checked={subjectSpecialization.includes(subject.name)} onChange={() => handleCheckboxChange(subject.name)} />
                {subject.name}
              </label>
            ))}
          </div>
        </div>

        <div className={styles.inputRow}>
          <div className={styles.inputGroup}>
            <label>Employment Type</label>
            <select value={employmentType} onChange={(e) => setEmploymentType(e.target.value)}>
              <option value="">Select employment type</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
            </select>
          </div>
          <div className={styles.inputGroup}>
            <label>Experience (Years)</label>
            <input type="number" placeholder="Enter experience" value={experience} onChange={(e) => setExperience(e.target.value)} />
          </div>
        </div>

        <div className={styles.inputRow}>
          <div className={styles.inputGroup}>
            <label>Salary</label>
            <input type="number" placeholder="Enter salary" value={salary} onChange={(e) => setSalary(e.target.value)} />
          </div>
          <div className={styles.inputGroup}>
            <label>Joining Date</label>
            <input type="date" value={joiningDate} onChange={(e) => setJoiningDate(e.target.value)} />
          </div>
        </div>

        <div className={styles.inputGroup}>
          <label>Department</label>
          <input type="text" placeholder="Enter department" value={department} onChange={(e) => setDepartment(e.target.value)} />
        </div>

        {error && <p className={styles.errorMessage}>{error}</p>}
        {message && <p className={styles.successMessage}>{message}</p>}

        <div className={styles.buttonContainer}>
          <button type="submit" className={styles.addStaffBtn}>Add Teacher</button>
          <button type="button" onClick={() => navigate(-1)} className={styles.cancelBtn}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default AddStaff;
