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

// ✅ Get team details by team code (for sharing/viewing)
router.get("/code/:teamCode", auth, async (req, res) => {
  try {
    const { teamCode } = req.params;
    const Team = require("../models/Team");

    const team = await Team.findOne({ teamCode })
      .populate("TeamHId", "userName email")
      .select("TeamName Prototype teamCode TeamHId TeamMembers");

    if (!team) return res.status(404).json({ message: "Invalid team code" });

    res.json({ message: "Team found", team });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Join a team using team code (optional, easy to add)
router.post("/join/:teamCode", auth, async (req, res) => {
  try {
    const { teamCode } = req.params;
    const userId = req.user.id;
    const Team = require("../models/Team");

    const team = await Team.findOne({ teamCode });
    if (!team) return res.status(404).json({ message: "Invalid team code" });

    if (team.TeamMembers.includes(userId)) {
      return res.status(400).json({ message: "Already a member of this team" });
    }

    team.TeamMembers.push(userId);
    await team.save();

    res.json({ message: "Joined team successfully", team });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
