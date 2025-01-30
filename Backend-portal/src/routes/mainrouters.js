const express = require('express');
const getStudentData = require('../controllers/gettingstudentdata'); // Direct import
const studentdata = require('../controllers/studentdata');
const EmergencyMailSending = require("../controllers/emergencymail");
const uploadImage =require("../controllers/imagesaving")
const router = express.Router();

router.post("/start", studentdata.studentdata);
router.get("/gettingStudent", getStudentData.getStudentData); // Adjusted to correct function name
router.post("/EmergencyMailSending", EmergencyMailSending.emergencyMail); 
router.post('/upload-my-profile', (req, res) => {
    console.log(req.body);  
    res.send('POST request received');
  });

module.exports = router;
 