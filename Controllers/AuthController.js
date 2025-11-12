const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const TokenBlacklist = require("../models/TokenBlacklist");


// ✅ REGISTER FUNCTION
const register = async (req, res) => {
  try {
    const {  userName, email, password } = req.body;
    if ( !userName || !email || !password)
      return res.status(400).json({ message: "All fields required" });

    // 2️⃣ Check duplicates
    const existingUser = await User.findOne({ email });
    const existingName = await User.findOne({ userName });

    if (existingUser)
      return res.status(400).json({ message: "User already exists" });
    if (existingName)
      return res.status(400).json({ message: "Username already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ userName, email, password: hashedPassword });

    // 5️⃣ Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 6️⃣ Send response with token + user data
    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        userName: user.userName,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Register Error:", err.message);
    res.status(500).json({ message: "Server error during registration" });
  }
};

// ✅ LOGIN FUNCTION
const login = async (req, res) => {
  try {
    const { email, password } = req.body; // this field can be username or email

    if (!email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    // 🔹 Find user by either email or username
    const user = await User.findOne({
      $or: [{ email }, { userName: email }],
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 🔹 Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    // 🔹 Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 🔹 Respond with token + user info
    res.status(200).json({
      message: "Welcome to AllySpace!",
      token,
      user: {
        id: user._id,
        userName: user.userName,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Login Error:", err.message);
    res.status(500).json({ message: "Server error during login" });
  }
};
const logout = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(400).json({ message: "Token missing from request" });
    }

    // Decode token to get expiry
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) {
      return res.status(400).json({ message: "Invalid token" });
    }

    const expiresAt = new Date(decoded.exp * 1000);

    // Add to blacklist
    await TokenBlacklist.create({ token, expiresAt });

    res.status(200).json({ message: "User logged out successfully" });
  } catch (err) {
    console.error("Logout Error:", err);
    res.status(500).json({ message: "Server error during logout" });
  }
};

module.exports = { register, login ,logout};