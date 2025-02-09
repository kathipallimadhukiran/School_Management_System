const Razorpay = require('razorpay'); // Import Razorpay SDK

const razorpay = new Razorpay({
  key_id: 'YOUR_RAZORPAY_KEY_ID',  // Your Razorpay Key ID
  key_secret: 'YOUR_RAZORPAY_KEY_SECRET'  // Your Razorpay Key Secret
});

// Create payment order route
router.post("/create-order", async (req, res) => {
  try {
    const { amount, studentId } = req.body; // amount in paise (e.g., 1000 for INR 10)

    // Ensure valid amount and studentId
    if (!amount || !studentId) {
      return res.status(400).json({ message: "Amount and studentId are required." });
    }

    // Find the student by MongoDB ObjectId (using _id field)
    const student = await User.findById(studentId);

    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }

    // Create Razorpay order
    const options = {
      amount: amount * 100,  // Amount in paise (Razorpay takes amount in paise)
      currency: "INR",
      receipt: `receipt#${Date.now()}`,
      notes: {
        studentName: student.Student_name
      }
    };

    // Create an order with Razorpay API
    const order = await razorpay.orders.create(options);

    res.status(200).json({
      message: "Order created successfully",
      orderId: order.id, // Send the orderId to frontend to initiate payment
      studentName: student.Student_name
    });

  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
