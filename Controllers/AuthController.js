const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const register = async (req, res) => {
  try {
    const { userName, email, password } = req.body;

    // 1️⃣ Validate input
    if (!userName || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    // 2️⃣ Check duplicates
    const existingUser = await User.findOne({ email });
    const existingName = await User.findOne({ userName });

    if (existingUser)
      return res.status(400).json({ message: "User already exists" });
    if (existingName)
      return res.status(400).json({ message: "Username already exists" });

    // 3️⃣ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4️⃣ Create user
    const user = await User.create({
      userName,
      email,
      password: hashedPassword,
    });

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



const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (user.password !== password) {
    return res.status(401).json({ message: "Incorrect password" });
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
  return res.json({ message: "Welcome to AllySpace!", token });
};

module.exports = { login , register};
