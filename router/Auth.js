const express = require("express");
const {SignUp,login}=require("../Controllers/AuthController.js");

const router = express.Router();

router.post("/signUp",SignUp);  
router.get("/login",login);
module.exports= router;
