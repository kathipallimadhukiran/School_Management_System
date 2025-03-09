const express = require("express");
const getStudentData = require("../controllers/gettingstudentdata");
const studentdata = require("../controllers/studentdata");
const EmergencyMailSending = require("../controllers/emergencymail");
const getfeedata = require("../controllers/feepayment/getfeedata");
const { Duemailer } = require("../controllers/Duemailer"); // ✅ Ensure correct import
const { Signup, Login, ForgotPassword, ResetPassword } = require("../controllers/Logincontroller");
const { UpdateStudentDetails, DeleteStudentDetails, AddFee } = require('../controllers/UpdateStudentDetails');
const { Add_Student_Class, Get_classes } = require("../controllers/classes/classes");



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
router.post('/AddFee', AddFee);
router.delete('/deletestudentdetails/:id', DeleteStudentDetails);
router.get('/Add_Student_Class', Add_Student_Class);
router.get('/Get_classes', Get_classes);



module.exports = router;
