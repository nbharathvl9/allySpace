const express = require("express");
const User = require("../models/User");

const router = express.Router();

// CREATE a new user
router.post("/", async (req, res) => {
  try {
    const { name, userName, email, password } = req.body;

    // Validate
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    // Create user (ID will be auto-assigned by pre-save hook)
    const user = new User({ name, userName, email, password });
    await user.save();

    res.status(201).json({ message: "User created successfully", user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
