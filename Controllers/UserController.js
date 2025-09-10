const User= require("../models/User.js");
module.exports = async (name, userName, email, password) => {
  try {
    if (!userName || !email || !password) {
      throw new Error("All fields required");
    }

    const user = new User({ name, userName, email, password });
    await user.save();

    return user;
  } catch (err) {
    throw new Error(err.message);
  }
};
