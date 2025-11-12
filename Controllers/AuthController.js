const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const TokenBlacklist = require("../models/TokenBlacklist");
const { OAuth2Client } = require("google-auth-library");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ✅ REGISTER FUNCTION
const register = async (req, res) => {
  try {
    const { userName, email, password } = req.body;
    if (!userName || !email || !password)
      return res.status(400).json({ message: "All fields required" });

    const existingUser = await User.findOne({ email });
    const existingName = await User.findOne({ userName });

    if (existingUser)
      return res.status(400).json({ message: "User already exists" });
    if (existingName)
      return res.status(400).json({ message: "Username already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      userName,
      email,
      password: hashedPassword,
    });

    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: { id: user._id, userName: user.userName, email: user.email },
    });
  } catch (err) {
    console.error("Register Error:", err.message);
    res.status(500).json({ message: "Server error during registration" });
  }
};

// ✅ LOGIN FUNCTION
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({
      $or: [{ email }, { userName: email }],
    });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Incorrect password" });

    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).json({
      message: "Welcome to AllySpace!",
      token,
      user: { id: user._id, userName: user.userName, email: user.email },
    });
  } catch (err) {
    console.error("Login Error:", err.message);
    res.status(500).json({ message: "Server error during login" });
  }
};

// ✅ GOOGLE SIGN-IN FUNCTION
const googleSignIn = async (req, res) => {
  try {
    const { token } = req.body;

    // Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    // Check if user exists
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        userName: name.replace(/\s+/g, "_").toLowerCase(),
        email,
        password: "google_oauth_user", // dummy
        profilePic: picture,
      });
    }

    // Generate JWT
    const jwtToken = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).json({
      message: "Google login successful",
      token: jwtToken,
      user: {
        id: user._id,
        email: user.email,
        userName: user.userName,
        picture: user.profilePic,
      },
    });
  } catch (err) {
    console.error("Google Sign-In Error:", err.message);
    res.status(500).json({ message: "Failed to verify Google token" });
  }
};

// ✅ LOGOUT
const logout = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(400).json({ message: "Token missing" });

    const decoded = jwt.decode(token);
    if (!decoded?.exp) return res.status(400).json({ message: "Invalid token" });

    const expiresAt = new Date(decoded.exp * 1000);
    await TokenBlacklist.create({ token, expiresAt });

    res.status(200).json({ message: "User logged out successfully" });
  } catch (err) {
    console.error("Logout Error:", err.message);
    res.status(500).json({ message: "Server error during logout" });
  }
};

module.exports = { register, login, logout, googleSignIn };
