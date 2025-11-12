const express = require("express");
const { register, login, logout, googleSignIn } = require("../Controllers/AuthController");

const router = express.Router();
const auth= require("../middleware/authMiddleware.js");
const User=require("../models/User.js");
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout); 
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("userName email _id");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
