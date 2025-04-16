const express = require("express");
const getStudentData = require("../controllers/gettingstudentdata");
const studentdata = require("../controllers/studentdata");
const EmergencyMailSending = require("../controllers/emergencymail");
const getfeedata = require("../controllers/feepayment/getfeedata");
const { Duemailer } = require("../controllers/Duemailer"); // ✅ Ensure correct import
const { Signup, Login, ForgotPassword, ResetPassword } = require("../controllers/Logincontroller");
const { UpdateStudentDetails, DeleteStudentDetails, AddFee } = require('../controllers/UpdateStudentDetails');
const {  assignStudentsToSection, createClass, assignSubjectToClass, addSubject, getAllSubjects, assignSubjectToTeacher, assignTeacherToSubject, getAllClass, getStudentsByIds, getTeachersByIds, getClassById, unassignStudentFromSection, updateStudentGrade, deleteSubject, getStudentswhounassigned, assignTeacherToSection, getSectionDetails, getsectionstudentlist, assignRollNumbersToStudents, getAssignedClasses } = require("../controllers/classes/classes");
const {  getAllTeachers } = require("../controllers/classes/teachers");
const { delete_class } = require("../controllers/delete_class");
const { enterMarks, getMarks, getSubjectDivisions } = require("../controllers/marks/entrymarks");
const { authsessions } = require("../controllers/authsessions");
const upload = require("../middlewares/uploadImage");
const { uploadImage } = require("../controllers/uploadTeacherImage");



const router = express.Router();

router.post("/start", studentdata.studentdata);
router.post("/auth/verify",authsessions);
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


router.post('/assignStudentsToSection', assignStudentsToSection);
router.post('/createClass', createClass);
router.post('/assignSubjectToClass', assignSubjectToClass);
router.post('/assignTeacherToSection', assignTeacherToSection);
router.post('/addSubject', addSubject);
router.get('/getAllSubjects', getAllSubjects);
router.get('/getAllClass', getAllClass);
router.post('/assignSubjectToTeacher', assignSubjectToTeacher);
// router.post('/assignTeacherToSubject', assignTeacherToSubject);
router.post('/getStudentsByIds', getStudentsByIds);
router.post('/getTeachersByIds', getTeachersByIds);
router.post('/assignRollNumbersToStudents', assignRollNumbersToStudents);
// routes/classRoutes.js
router.get("/getSectionDetails/:sectionId", getSectionDetails);
router.get("/getAllTeachers",getAllTeachers)
router.get("/getClassById/:classId", getClassById);
router.get("/:sectionId/students", getsectionstudentlist);
router.delete("/unassignStudentFromSection/:classId/:sectionId/:studentId", unassignStudentFromSection);

router.put("/updateStudentGrade/:studentId", updateStudentGrade);
router.get("/getStudents", getStudentswhounassigned);
router.get("/teachers/:teacherId/assigned-classes", getAssignedClasses);
router.delete("/deleteClass/:classId", delete_class);
router.delete("/deleteSubject/:id", deleteSubject);





router.post("/marks", enterMarks);
router.get("/getmarks", getMarks);
router.get("/getSubjectDivisions", getSubjectDivisions);


router.patch("/uploadTeacherImage/:id", upload.single("profileImage"), uploadImage);


module.exports = router;
