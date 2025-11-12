
const mongoose = require('mongoose');

const TeamSchema = new mongoose.Schema({
  TeamName: { type: String, required: true },
  TeamHId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  TeamMembers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // all members in whole team
  HR: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  Subteams: [{ type: mongoose.Schema.Types.ObjectId, ref: "Subteam" }],
  Prototype: { type: String },
}, { timestamps: true });

// Index to quickly find teams by head or members
TeamSchema.index({ TeamHId: 1 });
TeamSchema.index({ TeamMembers: 1 });

module.exports = mongoose.model('Team', TeamSchema);
