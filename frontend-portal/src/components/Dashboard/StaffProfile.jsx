import React, { useEffect, useState } from "react";
import styles from "./StaffProfile.module.css";

const StaffProfile = () => {
  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [teacherId, setTeacherId] = useState("");

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  useEffect(() => {
    const storedId = localStorage.getItem("userid");
    if (storedId) {
      setTeacherId(storedId);
    } else {
      setError("No teacher ID found in localStorage.");
    }
  }, []);

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
          body: JSON.stringify({ teacherIds: [teacherId] }), // Send as array
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

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('profileImage', file);

    try {
      const response = await fetch(`${API_URL}/uploadTeacherImage/${staff._id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      // Update staff with new image path
      setStaff(data.teacher);
    } catch (err) {
      setError(err.message);
      console.error('Upload error:', err);
    } finally {
      setLoading(false);
      e.target.value = ''; // Reset input
    }
  };

  if (loading && !staff) {
    return <div className={styles.messageLoading}>Loading profile...</div>;
  }

  if (error) {
    return <div className={styles.messageError}>{error}</div>;
  }

  if (!staff) {
    return <div className={styles.messageNeutral}>No profile available.</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.imageUploadContainer}>
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
              id="profile-upload"
              style={{ display: 'none' }}
            />
          </label>

          {error && <div className={styles.uploadError}>{error}</div>}
        </div>

        <h2 className={styles.title}>{staff.name}</h2>

        {/* Optional additional profile details */}
        <div className={styles.detailList}>
          <p><strong>Designation:</strong> {staff.designation}</p>
          <p><strong>Email:</strong> {staff.email}</p>
          <p><strong>Phone:</strong> {staff.phone}</p>
          {/* Add more details as necessary */}
        </div>
      </div>
    </div>
  );
};

export default StaffProfile;
