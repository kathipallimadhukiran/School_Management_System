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
    age: "",
    grade: "",
    address: "",
    city: "",
    state: "",
    district: "",
    zipCode: "",
    emergencyContactNumber: "",
    fatherNumber: "",
    motherNumber: "",
    numberOfTerms: "",
    feeType: "",
    feeAmount: "",
    feePaid: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);



  const [classes, setClasses] = useState([]);


  useEffect(() => {
    fetch("http://localhost:3000/getAllClass")
      .then((response) => response.json())
      .then((data) => setClasses(data))
      .catch((error) => console.error("Error fetching classes:", error));
  }, []);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "http://localhost:3000/gettingStudent"
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
      age: student.Student_age,
      grade: student.Grade_applying_for,
      address: student.Address,
      city: student.City,
      state: student.State,
      district: student.District,
      zipCode: student.ZIP_code,
      emergencyContactNumber: student.Emergency_contact_number,
      fatherNumber: student.Student_father_number,
      motherNumber: student.Student_mother_number,
      numberOfTerms: student.Number_of_terms,
    });
    setIsUpdateModalOpen(true);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();

    const updateData = {
      id: selectedStudent._id,  // Ensure this is defined
      Student_name: formData.name,
      Student_age: formData.age,
      Grade_applying_for: formData.grade,
      Address: formData.address,
      City: formData.city,
      State: formData.state,
      District: formData.district,
      ZIP_code: formData.zipCode,
      Emergency_contact_number: formData.emergencyContactNumber,
      Student_father_number: formData.fatherNumber,
      Student_mother_number: formData.motherNumber,
      Number_of_terms: formData.numberOfTerms,
      Total_fee: formData.totalFee,
      Fathers_mail: formData.fathersMail,
      Student_mother_name: formData.motherName,
      Student_gender: formData.gender,
      Date_of_birth: formData.dateOfBirth,
      Student_father_name: formData.fatherName,
    };

    console.log("Sending update request with data:", updateData);

    try {
      await axios.put(`http://localhost:3000/updatestudentdetails`, updateData);
      fetchStudents();
      setIsUpdateModalOpen(false);
      toast.success("Student updated successfully.");
    } catch (error) {
      console.error("Error updating student:", error.response ? error.response.data : error);
      toast.error("Error updating student. Please try again.");
    }
  };



  const handleAddFeeClick = (student) => {
    setSelectedStudent(student);
    setFormData({
      ...formData,
      feeType: "",
      feeAmount: "",
      feePaid: "",
    });
    setIsFeeModalOpen(true);
  };

  const handleAddFeeSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log({
        id: selectedStudent._id,
        FeeType: formData.feeType,
        FeeAmount: formData.feeAmount,
        FeePaid: formData.feePaid,
      })
      await axios.post(`http://localhost:3000/AddFee`, {
        id: selectedStudent._id,
        FeeType: formData.feeType,
        FeeAmount: formData.feeAmount,
        FeePaid: formData.feePaid,
      });

      fetchStudents();
      setIsFeeModalOpen(false);
      toast.success("Fee added successfully.");
    } catch (error) {
      console.error("Error adding fee:", error);
      toast.error("Error adding fee. Please try again.");
    }
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
                <h3>Update {formData.name} Details</h3>
                <form onSubmit={handleUpdateSubmit}>
                  <label>
                    Age:
                    <input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleInputChange}
                      required
                    />
                  </label>
                  <label>
  Grade:
  <select
    name="grade"
    value={formData.grade}
    onChange={handleInputChange}
    required
  >
    {/* Show student's past grade first */}
    <option value={formData.grade} disabled>
      {formData.grade} (Current)
    </option>

    {/* Render all available classes */}
    {classes.map((cls) => (
      <option key={cls._id} value={cls.name}>
        {cls.name}
      </option>
    ))}
  </select>
</label>

                  <label>
                    Address:
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                    />
                  </label>
                  <label>
                    City:
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                    />
                  </label>
                  <label>
                    State:
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      required
                    />
                  </label>
                  <label>
                    District:
                    <input
                      type="text"
                      name="district"
                      value={formData.district}
                      onChange={handleInputChange}
                      required
                    />
                  </label>
                  <label>
                    ZIP Code:
                    <input
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      required
                    />
                  </label>
                  <label>
                    Emergency Contact Number:
                    <input
                      type="text"
                      name="emergencyContactNumber"
                      value={formData.emergencyContactNumber}
                      onChange={handleInputChange}
                      required
                    />
                  </label>
                  <label>
                    Father's Mobile Number:
                    <input
                      type="text"
                      name="fatherNumber"
                      value={formData.fatherNumber}
                      onChange={handleInputChange}
                      required
                    />
                  </label>
                  <label>
                    Mother's Mobile Number:
                    <input
                      type="text"
                      name="motherNumber"
                      value={formData.motherNumber}
                      onChange={handleInputChange}
                      required
                    />
                  </label>
                  <label>
                    Number of Terms:
                    <input
                      type="text"
                      name="numberOfTerms"
                      value={formData.numberOfTerms}
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
                    Fee Type:
                    <input
                      type="text"
                      name="feeType"
                      value={formData.feeType}
                      onChange={handleInputChange}
                      required
                    />
                  </label>
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
                  <label>
                    Fee Paid:
                    <input
                      type="number"
                      name="feePaid"
                      value={formData.feePaid}
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
                <button onClick={() => {setIsDeleteModalOpen(false)
                  setFormData(null)
                }}>
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
