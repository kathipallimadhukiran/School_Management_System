const express = require('express');
const getFeeData=require("../controllers/feepayment/getfeedata");
const postfeepayments=require("../controllers/postfeepayments")

const router = express.Router();

router.post("/create-order",postfeepayments.createOrder);
router.post("/record-payment",postfeepayments.recordPayment);
router.get("/get-fee-data/:studentId", getFeeData.getFeeData);




module.exports = router;
 