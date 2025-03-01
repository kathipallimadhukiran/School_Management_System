import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify"; // Import toast and ToastContainer
import "react-toastify/dist/ReactToastify.css"; // Import toast styles
import styles from "./StudentManagement.module.css";

const StudentManagement = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isFeeModalOpen, setIsFeeModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    grade: "",
    feeAmount: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "https://school-site-2e0d.onrender.com/gettingStudent"
      );
      if (response.data && Array.isArray(response.data.data)) {
        setStudents(response.data.data);
      } else {
        throw new Error("Invalid data format from API");
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      setError(error.message);
      toast.error("Error fetching students. Please try again."); // Show error toast
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleUpdateClick = (student) => {
    setSelectedStudent(student);
    setFormData({
      name: student.Student_name,
      grade: student.grade || "",
      feeAmount: "",
    });
    setIsUpdateModalOpen(true);
  };

  const handleAddFeeClick = (student) => {
    setSelectedStudent(student);
    setIsFeeModalOpen(true);
  };

  const handleDeleteClick = (student) => {
    setSelectedStudent(student);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteSubmit = async () => {
    try {
      await axios.delete(`http://localhost:3000/deletestudentdetails/${selectedStudent._id}`);
      fetchStudents();
      setIsDeleteModalOpen(false);
      toast.success("Student deleted successfully.");
    } catch (error) {
      console.error("Error deleting student:", error);
      toast.error("Error deleting student. Please try again.");
    }
  };

  return (
    <div className={styles.container}>
      {/* Back Button */}
      <div className={styles.backDiv}>
        <button className={styles.backButton} onClick={() => navigate(-1)}>
          ← Back
        </button>
      </div>
      <h2>Student Management</h2>

      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={3000} // Auto-close after 3 seconds
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      {loading ? (
        <p className={styles.loading}>Loading students...</p>
      ) : error ? (
        <p className={styles.error}>Error: {error}</p>
      ) : (
        <>
          <table className={styles.studentTable}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Father's Name</th>
                <th>Mobile Number</th>
                <th>Fee Paid</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student._id}>
                  <td>{student.Student_name}</td>
                  <td>{student.Student_father_name}</td>
                  <td>{student.Student_father_number}</td>
                  <td>₹{student.Total_Fee_Paid}</td>
                  <td>
                    <button
                      className={styles.updateButton}
                      onClick={() => handleUpdateClick(student)}
                    >
                      Update
                    </button>
                    <button
                      className={styles.feeButton}
                      onClick={() => handleAddFeeClick(student)}
                    >
                      Add Fee
                    </button>
                    <button
                      className={styles.deleteButton}
                      onClick={() => handleDeleteClick(student)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {isUpdateModalOpen && (
            <div className={styles.modal}>
              <div className={styles.modalContent}>
                <h3>Update Student</h3>
                <form onSubmit={handleUpdateSubmit}>
                  <label>
                    Name:
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </label>
                  <label>
                    Grade:
                    <input
                      type="text"
                      name="grade"
                      value={formData.grade}
                      onChange={handleInputChange}
                      required
                    />
                  </label>
                  <button type="submit">Update</button>
                  <button
                    type="button"
                    onClick={() => setIsUpdateModalOpen(false)}
                  >
                    Cancel
                  </button>
                </form>
              </div>
            </div>
          )}

          {isFeeModalOpen && (
            <div className={styles.modal}>
              <div className={styles.modalContent}>
                <h3>Add Fee for {selectedStudent?.Student_name}</h3>
                <form onSubmit={handleAddFeeSubmit}>
                  <label>
                    Fee Amount:
                    <input
                      type="number"
                      name="feeAmount"
                      value={formData.feeAmount}
                      onChange={handleInputChange}
                      required
                    />
                  </label>
                  <button type="submit">Add Fee</button>
                  <button
                    type="button"
                    onClick={() => setIsFeeModalOpen(false)}
                  >
                    Cancel
                  </button>
                </form>
              </div>
            </div>
          )}

          {isDeleteModalOpen && (
            <div className={styles.modal}>
              <div className={styles.modalContent}>
                <h3>Delete Student</h3>
                <p>
                  Are you sure you want to delete {selectedStudent?.Student_name}?
                </p>
                <button onClick={handleDeleteSubmit}>Yes, Delete</button>
                <button onClick={() => setIsDeleteModalOpen(false)}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default StudentManagement;
