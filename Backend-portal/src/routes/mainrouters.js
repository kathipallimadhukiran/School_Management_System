const express = require('express');
const getStudentData = require('../controllers/gettingstudentdata'); // Direct import
const studentdata = require('../controllers/studentdata');
const EmergencyMailSending=require("../controllers/emergencymail")
const router = express.Router();

router.post("/start", studentdata.studentdata);
router.get("/gettingStudent", getStudentData); 
router.post("/EmergencyMailSending",EmergencyMailSending.emergencyMail ); 

module.exports = router;
