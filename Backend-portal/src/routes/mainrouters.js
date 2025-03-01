const express = require("express");
const getStudentData = require("../controllers/gettingstudentdata");
const studentdata = require("../controllers/studentdata");
const EmergencyMailSending = require("../controllers/emergencymail");
const getfeedata = require("../controllers/feepayment/getfeedata");
const { Duemailer } = require("../controllers/Duemailer"); // ✅ Ensure correct import
const { Signup, Login, ForgotPassword, ResetPassword } = require("../controllers/Logincontroller");
const { UpdateStudentDetails, DeleteStudentDetails } = require('../controllers/UpdateStudentDetails');



const router = express.Router();

router.post("/start", studentdata.studentdata);
router.get("/gettingStudent", getStudentData.getStudentData);
router.post("/EmergencyMailSending", EmergencyMailSending.emergencyMail);
router.post("/getfeedata", getStudentData.getStudentData);

// ✅ Use `POST` instead of `GET` for sending emails
router.post("/sendDueReminder", Duemailer); 
// Define Routes
router.post("/Signup", Signup);
router.post("/Login", Login);
router.post("/ForgotPassword", ForgotPassword);
router.post("/ResetPassword", ResetPassword);
router.put('/updatestudentdetails', UpdateStudentDetails);
router.delete('/deletestudentdetails/:id', DeleteStudentDetails);



module.exports = router;
