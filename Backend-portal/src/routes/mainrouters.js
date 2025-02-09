const express = require('express');
const getStudentData = require('../controllers/gettingstudentdata'); // Direct import
const studentdata = require('../controllers/studentdata');
const EmergencyMailSending = require("../controllers/emergencymail");
const getfeedata=require("../controllers/feepayment/getfeedata")
const router = express.Router();

router.post("/start", studentdata.studentdata);
router.get("/gettingStudent", getStudentData.getStudentData); // Adjusted to correct function name
router.post("/EmergencyMailSending", EmergencyMailSending.emergencyMail); 
router.post("/getfeedata", getStudentData.getStudentData); 





module.exports = router;
 