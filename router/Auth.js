const express = require("express");
const { register, login, logout, googleSignIn } = require("../Controllers/AuthController");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/google", googleSignIn); // ✅ Google login route

module.exports = router;
