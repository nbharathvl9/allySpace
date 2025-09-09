const mongoose = require("mongoose");

const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // sequence name
  seq: { type: Number, default: 3 }
});

module.exports = mongoose.model("Counter", counterSchema);
