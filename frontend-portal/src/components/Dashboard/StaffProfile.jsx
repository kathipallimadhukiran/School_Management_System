import React, { useEffect, useState } from "react";
import styles from "./StaffProfile.module.css";

const StaffProfile = () => {
  const [staff, setStaff] = useState(null);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [teacherId, setTeacherId] = useState("");

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  // Get teacher ID from localStorage
  useEffect(() => {
    const storedId = localStorage.getItem("userid");
    if (storedId) {
      setTeacherId(storedId);
    } else {
      setError("No teacher ID found in localStorage.");
    }
  }, []);

  // Fetch staff profile
  useEffect(() => {
    const fetchStaffProfile = async () => {
      if (!teacherId) return;

      setLoading(true);
      setError("");

      try {
        const response = await fetch(`${API_URL}/getTeachersByIds`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ teacherIds: [teacherId] }),
        });

        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.message || "Failed to load staff profile");
        }

        const data = await response.json();
        setStaff(Array.isArray(data) ? data[0] : data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStaffProfile();
  }, [teacherId, API_URL]);

  // Fetch all classes (for name and section lookups)
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await fetch(`${API_URL}/getAllClass`);
        const data = await res.json();
        setClasses(data);
      } catch (err) {
        console.error("Error fetching classes:", err);
      }
    };

    fetchClasses();
  }, [API_URL]);

  // Image Upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("profileImage", file);

    try {
      const response = await fetch(`${API_URL}/uploadTeacherImage/${staff._id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setStaff(data.teacher);
    } catch (err) {
      setError(err.message);
      console.error("Upload error:", err);
    } finally {
      setLoading(false);
      e.target.value = "";
    }
  };

  const getClassAndSectionName = (classId, sectionId) => {
    const cls = classes.find((c) => c._id === classId);
    if (!cls) return { className: classId, sectionName: sectionId };

    const section = cls.sections.find((s) => s._id === sectionId);
    return {
      className: cls.name || classId,
      sectionName: section?.name || sectionId,
    };
  };

  if (loading && !staff) return <div className={styles.messageLoading}>Loading profile...</div>;
  if (error) return <div className={styles.messageError}>{error}</div>;
  if (!staff) return <div className={styles.messageNeutral}>No profile available.</div>;

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.headerSection}>
          <div className={styles.imageSection}>
            <div className={styles.imageWrapper}>
              <img
                src={
                  staff.profileImage
                    ? `${API_URL}${staff.profileImage}?ts=${new Date().getTime()}`
                    : `${API_URL}/images/default.png`
                }
                alt="Profile"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `${API_URL}/images/default.png`;
                }}
              />
              {loading && <div className={styles.uploadOverlay}>Uploading...</div>}
            </div>
            <label className={styles.uploadButton}>
              {loading ? "Uploading..." : "Change Photo"}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className={styles.uploadInput}
                disabled={loading}
              />
            </label>
          </div>
          <div className={styles.nameSection}>
            <h2>{staff.name}</h2>
            <p className={styles.designation}>{staff.designation || "Teacher"}</p>
          </div>
        </div>

        <div className={styles.detailsGrid}>
          <div><strong>Staff ID:</strong> {staff.staffID}</div>
          <div><strong>Role:</strong> {staff.role}</div>
          <div><strong>Email:</strong> {staff.email}</div>
          <div><strong>Phone:</strong> {staff.phone}</div>
          <div><strong>Gender:</strong> {staff.gender}</div>
          <div><strong>DOB:</strong> {new Date(staff.dob).toLocaleDateString()}</div>
          <div><strong>Address:</strong> {staff.address}</div>
          <div><strong>Experience:</strong> {staff.experience} years</div>
          <div><strong>Salary:</strong> ₹{staff.salary || "N/A"}</div>
          <div><strong>Joining Date:</strong> {new Date(staff.joiningDate).toLocaleDateString()}</div>
          <div><strong>Subject Specialization:</strong> {staff.subjectSpecialization.join(", ")}</div>
          <div><strong>Class Teacher Of:</strong> {staff.ClassTeacher || "None"}</div>
        </div>

        {staff.assignedClasses?.length > 0 && (
  <div className={styles.assignedClasses}>
    <h3>Assigned Classes</h3>
    <div className={styles.cardGrid}>
      {staff.assignedClasses.map((item, index) => {
        const { className, sectionName } = getClassAndSectionName(item.classId, item.sectionId);
        return (
          <div key={index} className={styles.classCard}>
            <p><strong>Class:</strong> {className}</p>
            <p><strong>Section:</strong> {sectionName}</p>
          </div>
        );
      })}
    </div>
  </div>
)}
    
      </div>
    </div>
  );
};

export default StaffProfile;
