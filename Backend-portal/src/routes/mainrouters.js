const express = require("express");
const getStudentData = require("../controllers/gettingstudentdata");
const studentdata = require("../controllers/studentdata");
const EmergencyMailSending = require("../controllers/emergencymail");
const getfeedata = require("../controllers/feepayment/getfeedata");
const { Duemailer } = require("../controllers/Duemailer"); // ✅ Ensure correct import
const { Signup, Login, ForgotPassword, ResetPassword } = require("../controllers/Logincontroller");
const { UpdateStudentDetails, DeleteStudentDetails, AddFee } = require('../controllers/UpdateStudentDetails');
const {  assignStudentToClass, createClass, assignSubjectToClass, addTeacher, assignTeacherToClass, addSubject, getAllSubjects, assignSubjectToTeacher, assignTeacherToSubject, getAllClass, getStudentsByIds, getTeachersByIds, getClassById, unassignStudentFromClass, updateStudentGrade, getStudents } = require("../controllers/classes/classes");
const { default: getAllTeachers } = require("../controllers/classes/teachers");



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


router.post('/assignStudentToClass', assignStudentToClass);
router.post('/createClass', createClass);
router.post('/assignSubjectToClass', assignSubjectToClass);
// router.post('/addTeacher', addTeacher);
router.post('/assignTeacherToClass', assignTeacherToClass);
// router.post('/addSubject', addSubject);
router.get('/getAllSubjects', getAllSubjects);
router.get('/getAllClass', getAllClass);
router.post('/assignSubjectToTeacher', assignSubjectToTeacher);
// router.post('/assignTeacherToSubject', assignTeacherToSubject);
router.post('/getStudentsByIds', getStudentsByIds);
router.post('/getTeachersByIds', getTeachersByIds);
router.get("/getAllTeachers",getAllTeachers)
router.get("/getClassById/:classId", getClassById);
router.delete("/unassignStudentFromClass/:classId/:studentId", unassignStudentFromClass);
router.put("/updateStudentGrade/:studentId", updateStudentGrade);
router.get("/getStudents", getStudents);


module.exports = router;
