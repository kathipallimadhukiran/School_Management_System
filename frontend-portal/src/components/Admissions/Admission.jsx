import { useState, useEffect } from "react";
import "./Admission.css";

function Admission() {
  const initialState = {
    Student_name: "",
    Student_age: null, // Reset to null
    Student_gender: "",
    Grade_applying_for: "",
    Date_of_birth: "",
    Address: "",
    City: "",
    State: "",
    District: "",
    ZIP_code: "",
    Emergency_contact_number: null, // Reset to null
    Student_father_name: "",
    Student_mother_name: "",
    Student_father_number: null, // Reset to null
    Student_mother_number: null, // Reset to null
    Fathers_mail: "",
    Total_fee: 0, // Reset total fee to 0
    Number_of_terms: null, // Reset number of terms to null
    fees: [], // Reset fees array
  };
  

  const [formData, setFormData] = useState(initialState);
  const [Totalfee, setTotalfee] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [pinCodeValid, setPinCodeValid] = useState(true);
  const [showPopup, setShowPopup] = useState(true);
  const [registrationDetails, setRegistrationDetails] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    if (name === "ZIP_code") {
      validatePinCode(value);
    }
  };

  const validatePinCode = async (pinCode) => {
    try {
      const response = await fetch(`https://api.postalpincode.in/pincode/${pinCode}`);
      const data = await response.json();

      if (data[0].Status === "Success") {
        const { Name: postOfficeName, State, District } = data[0].PostOffice[0];
        setFormData((prevData) => ({
          ...prevData,
          City: postOfficeName || prevData.City,
          State: State || prevData.State,
          District: District || prevData.District,
        }));
        setPinCodeValid(true);
      } else {
        setPinCodeValid(false);
      }
    } catch (error) {
      setPinCodeValid(false);
    }
  };

  // Add Fee Row Function
  const addFeeRow = () => {
    setFormData((prevData) => ({
      ...prevData,
      fees: [
        ...prevData.fees,
        { FeeType: "", FeeAmount: "" }, // Add new fee row with empty values
      ],
    }));
  };

  // Remove Fee Row Function
  const removeFeeRow = (index) => {
    const updatedFees = formData.fees.filter((_, i) => i !== index);
    setFormData((prevData) => ({
      ...prevData,
      fees: updatedFees,
    }));
  };

  // Handle Fee Row Change
  const handleFeeChange = (e, index) => {
    const { name, value } = e.target;
    const updatedFees = [...formData.fees];
    updatedFees[index][name] = value;
    setFormData((prevData) => ({
      ...prevData,
      fees: updatedFees,
    }));
  };

  // Calculate Total Fee
  const calculateTotalFee = () => {
    let newTotalFee = formData.fees.reduce((total, fee) => total + (parseFloat(fee.FeeAmount) || 0), 0);
    setFormData((prevData) => ({
      ...prevData,
      Total_fee: newTotalFee, // Only update Total_fee
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!formData.Student_name || !formData.Student_age || !formData.Emergency_contact_number) {
      alert("Please fill all required fields.");
      return;
    }
  if(formData.Total_fee != formData.fees.reduce((total, fee) => total + (parseFloat(fee.FeeAmount) || 0), 0)){
    alert("Some fees not added to Total fee");
    return;
  }
  
    setIsLoading(true);
  
    try {
      const response = await fetch("http://localhost:3000/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        const result = await response.json();
        setRegistrationDetails(result);
        setShowPopup(true);
        alert("Form submitted successfully!");
      

        setFormData({
          ...initialState, 
          Student_age: "", 
          Emergency_contact_number: "", 
          Student_father_number: "", 
          Student_mother_number: "", 
          Number_of_terms: "", 
          Total_fee: 0, 
          fees: [], 
        });
      
        setTotalfee(0);
      }
      
       else {
        alert("Failed to send data to the server.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while sending data to the server.");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="main">
      <form onSubmit={handleSubmit}>
        <h2>Primary School Admission Form</h2>

        <div className="field-row">
          <div className="field">
            <label>Student Name:</label>
            <input
              type="text"
              name="Student_name"
              placeholder="Student Name"
              value={formData.Student_name}
              onChange={handleChange}
            />
          </div>

          <div className="field">
            <label>Student Age:</label>
            <input
              type="number"
              name="Student_age"
              placeholder="Age"
              value={formData.Student_age}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="field-row">
          <div className="field">
            <label>Gender:</label>
            <select
              name="Student_gender"
              value={formData.Student_gender}
              onChange={handleChange}
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="field">
            <label>Date of Birth:</label>
            <input
              type="date"
              name="Date_of_birth"
              value={formData.Date_of_birth}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="field-row">
          <div className="field">
            <label>Grade Applying For:</label>
            <select
              name="Grade_applying_for"
              value={formData.Grade_applying_for}
              onChange={handleChange}
            >
              <option value="">Select Grade</option>
              <option value="Nursery">Nursery</option>
              <option value="LKG">LKG</option>
              <option value="UKG">UKG</option>
              <option value="1st Standard">1st Standard</option>
              <option value="2nd Standard">2nd Standard</option>
              <option value="3rd Standard">3rd Standard</option>
              <option value="4th Standard">4th Standard</option>
              <option value="5th Standard">5th Standard</option>
            </select>
          </div>

          <div className="field">
            <label>Address:</label>
            <input
              type="text"
              name="Address"
              placeholder="Enter Full Address"
              value={formData.Address}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="field-row">
          <div className="field">
            <label>ZIP Code:</label>
            <input
              type="text"
              name="ZIP_code"
              placeholder="ZIP Code"
              value={formData.ZIP_code}
              onChange={handleChange}
            />
            {!pinCodeValid && <span style={{ color: "red" }}>Invalid PIN Code</span>}
          </div>

          <div className="field">
            <label>State:</label>
            <input
              type="text"
              name="State"
              placeholder="State"
              value={formData.State}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="field-row">
          <div className="field">
            <label>District:</label>
            <input
              type="text"
              name="District"
              placeholder="District"
              value={formData.District}
              onChange={handleChange}
            />
          </div>
          <div className="field">
            <label>City:</label>
            <input
              type="text"
              name="City"
              placeholder="City"
              value={formData.City}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="field-row">
          <div className="field">
            <label>Emergency Contact Number:</label>
            <input
              type="number"
              name="Emergency_contact_number"
              placeholder="Emergency Contact number"
              value={formData.Emergency_contact_number}
              onChange={handleChange}
            />
          </div>

          <div className="field">
            <label>Father's Email:</label>
            <input
              type="email"
              name="Fathers_mail"
              placeholder="Father's Email"
              value={formData.Fathers_mail}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="field-row">
          <div className="field">
            <label>Father's Name:</label>
            <input
              type="text"
              name="Student_father_name"
              placeholder="Father's Name"
              value={formData.Student_father_name}
              onChange={handleChange}
            />
          </div>

          <div className="field">
            <label>Father's Phone Number:</label>
            <input
              type="tel"
              name="Student_father_number"
              placeholder="Father's Phone Number"
              value={formData.Student_father_number}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="field-row">
          <div className="field">
            <label>Mother's Name:</label>
            <input
              type="text"
              name="Student_mother_name"
              placeholder="Mother's Name"
              value={formData.Student_mother_name}
              onChange={handleChange}
            />
          </div>
          <div className="field">
            <label>Mother's Phone Number:</label>
            <input
              type="tel"
              name="Student_mother_number"
              placeholder="Mother's Phone Number"
              value={formData.Student_mother_number}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Fee Rows */}
        <div className="fee-details">
          <h3>Fee Details</h3>
          <table>
            <thead>
              <tr>
                <th>Fee Type</th>
                <th>Fee Amount</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {formData.fees.map((fee, index) => (
                <tr key={index}>
                  <td>
                    <input
                      type="text"
                      name="FeeType"
                      placeholder="Type of Fee"
                      value={fee.FeeType}
                      onChange={(e) => handleFeeChange(e, index)}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      name="FeeAmount"
                      placeholder="Fee Amount"
                      value={fee.FeeAmount}
                      onChange={(e) => handleFeeChange(e, index)}
                    />
                  </td>
                  <td>
                    <button type="button" onClick={() => removeFeeRow(index)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button type="button" onClick={addFeeRow}>
            Add Fee Row
          </button>
          <button type="button" onClick={calculateTotalFee}>
            Calculate Total Fee
          </button>
        </div>

        <div className="field-row">
          <div className="field">
            <label>Total Fee:</label>
            <input
              type="number"
              name="Total_fee"
              placeholder="Total Fee"
              value={formData.Total_fee}
              onChange={handleChange}
              disabled
            />
          </div>

          <div className="field">
            <label>Number of Terms:</label>
            <input
              type="number"
              name="Number_of_terms"
              placeholder="Number of Terms"
              value={formData.Number_of_terms}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Submit and Reset Buttons */}
        <div className="buttons-main">
          <div className="buttons">
            <button type="submit" disabled={isLoading}>
              {isLoading ? "Submitting..." : "Submit"}
            </button>
            <button type="button" onClick={() => setFormData(initialState)}>
              Reset
            </button>
          </div>
        </div>
      </form>

      {/* Show confirmation popup */}
      {showPopup && registrationDetails && (
        <div className="popup">
          <h3>Admission Successful!</h3>
          <p>Student Name: {registrationDetails.studentName}</p>
          <p>Registration Number: {registrationDetails.regNo}</p>
          <p>Father's Name: {registrationDetails.fatherName}</p>
          <p>Father's Phone: {registrationDetails.fatherPhone}</p>
          <p>Total Fee: {registrationDetails.totalFee}</p>
          <p>Total Terms: {registrationDetails.totalTerms}</p>
          <button onClick={() => setShowPopup(false)}>Close</button>
        </div>
      )}
    </div>
  );
}

export default Admission;
