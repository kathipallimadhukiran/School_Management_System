const express = require("express");
const {  getTotalDueAmounts, getTeachercount, getClasscount } = require("../controllers/Amindashboardaggrigations/aggrigations");

const router = express.Router();

router.get("/totalDueAmounts", getTotalDueAmounts);
router.get("/getTeachercount", getTeachercount);
router.get("/getClasscount", getClasscount);

module.exports = router;