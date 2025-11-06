const User= require("../models/User.js");
const bcrypt = require("bcryptjs");
module.exports = async (name, userName, email, password) => {
  try {
    if (!userName || !email || !password) {
      throw new Error("All fields required");
    }

    const hashedPassword = await bcrypt.hash(password, 10);


    const user = new User({
        name, 
        userName, 
        email, 
        password : hashedPassword,
       });


    await user.save();
    
    return user;
  } catch (err) {
    throw new Error(err.message);
  }
};
