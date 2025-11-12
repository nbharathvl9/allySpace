const mongoose = require("mongoose");

const TeamSchema = new mongoose.Schema({
  TeamName: {
    type: String,
    required: true,
    unique: true,
  },
  Prototype: {
    type: String,
  },
  TeamHId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  TeamMembers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  teamCode: {
    type: String,
    unique: true,
    required: true,
  },
});

module.exports = mongoose.model("Team", TeamSchema);
