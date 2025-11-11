const Notification = require("../models/Notification");
const Team = require("../models/Team");
const Subteam = require("../models/Subteam");
const User = require("../models/User");

// ✅ Create a new Team
exports.createTeam = async (req, res) => {
  try {
    const { TeamName, Prototype } = req.body;
    const userId = req.user.id; // logged-in user (Team Head)

    if (!TeamName) {
      return res.status(400).json({ message: "Team name is required" });
    }

    // Create new team
    const newTeam = await Team.create({
      TeamName,
      Prototype,
      TeamHId: userId,
      TeamMembers: [userId], // Team head is also first member
    });

    res.status(201).json({
      message: "Team created successfully",
      team: newTeam,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Team Head or Subteam Head can invite members
exports.inviteMember = async (req, res) => {
  try {
    const { teamId, subteamId } = req.params; // subteamId optional
    const { memberId } = req.body;
    const requesterId = req.user.id;

    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ message: "Team not found" });

    // If subteamId provided → check subteam permissions
    if (subteamId) {
      const subteam = await Subteam.findById(subteamId);
      if (!subteam) return res.status(404).json({ message: "Subteam not found" });

      const isSubteamHead = subteam.headId?.toString() === requesterId;
      const isTeamHead = team.TeamHId.toString() === requesterId;

      if (!isSubteamHead && !isTeamHead) {
        return res.status(403).json({ message: "Only Subteam Head or Team Head can invite members to this subteam" });
      }

      // Create notification for subteam invite
      const notification = await Notification.create({
        recipientId: memberId,
        senderId: requesterId,
        teamId,
        type: "SUBTEAM_INVITE",
        message: `You have been invited to join subteam "${subteam.name}" under team "${team.TeamName}".`,
      });

      return res.status(201).json({ message: "Subteam invitation sent successfully", notification });
    }

    // 🟦 Team-level invite (main team)
    const isTeamHead = team.TeamHId.toString() === requesterId;
    if (!isTeamHead) {
      return res.status(403).json({ message: "Only Team Head can invite members to the main team" });
    }

    // Create notification for team invite
    const notification = await Notification.create({
      recipientId: memberId,
      senderId: requesterId,
      teamId,
      type: "TEAM_INVITE",
      message: `You have been invited to join team "${team.TeamName}".`,
    });

    res.status(201).json({ message: "Team invitation sent successfully", notification });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
