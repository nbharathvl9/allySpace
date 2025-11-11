const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const teamController = require("../Controllers/teamController");

// ✅ Create team
router.post("/create", auth, teamController.createTeam);

// 🟩 Invite member to main team
router.post("/:teamId/invite", auth, teamController.inviteMember);

// 🟨 Invite member to a subteam
router.post("/:teamId/subteams/:subteamId/invite", auth, teamController.inviteMember);

module.exports = router;
