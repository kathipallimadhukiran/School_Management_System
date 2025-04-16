const User = require("../models/loginsdata");
const bcrypt = require("bcryptjs");

const authsessions = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "Email and password are required" 
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid password" 
      });
    }

    // If you want to return more user data (without password)
    const userData = {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role
    };

    res.json({ 
      success: true,
      user: userData
    });

  } catch (err) {
    console.error("Auth error:", err);
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
};

module.exports = { authsessions };