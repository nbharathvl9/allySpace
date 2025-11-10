const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
  recipientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // who receives it
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },   // who sent it
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
  type: { type: String, enum: ["TEAM_INVITE"], default: "TEAM_INVITE" },
  message: { type: String },
  status: { type: String, enum: ["Pending", "Accepted", "Rejected"], default: "Pending" },
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model("Notification", NotificationSchema);
