const Notification = require("../models/Notification");
const Team = require("../models/Team");
const Subteam = require("../models/Subteam");
const User = require("../models/User");

// ✅ Create a new Team
exports.createTeam = async (req, res) => {
  try {
    const { TeamName, Prototype } = req.body;
    const userId = req.user.id;

    if (!TeamName) {
      return res.status(400).json({ message: "Team name is required" });
    }

    // Generate unique team code
    let teamCode;
    let isUnique = false;

    while (!isUnique) {
      teamCode = `ALLY#${Math.floor(10000 + Math.random() * 90000)}`;
      const existing = await Team.findOne({ teamCode });
      if (!existing) isUnique = true;
    }

    // Create new team
    const newTeam = await Team.create({
      TeamName,
      Prototype,
      TeamHId: userId,
      TeamMembers: [userId],
      teamCode, // ✅ save unique code
    });

    res.status(201).json({
      message: "Team created successfully",
      team: newTeam,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// Controllers/teamController.js
exports.getMyTeams = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1️⃣ Fetch all teams where user is head or member
    const teams = await Team.find({
      $or: [{ TeamHId: userId }, { TeamMembers: userId }],
    })
      .populate("TeamHId", "userName email")
      .populate({
        path: "Subteams",
        populate: [
          { path: "headId", select: "userName email" },
          { path: "members", select: "userName email" },
          {
            path: "tasks",
            select: "title status assignee dueDate",
            populate: { path: "assignee", select: "userName email" },
          },
        ],
      });

    // 2️⃣ Build role-aware response
    const formatted = teams.map((team) => {
      let role = "MEMBER";

      // check if current user is team head
      if (team.TeamHId && team.TeamHId._id.toString() === userId) {
        role = "HEAD";
      } else {
        // check subteams
        for (const sub of team.Subteams || []) {
          if (sub.headId && sub.headId._id.toString() === userId) {
            role = "SUB_HEAD";
            break;
          }
          if (sub.members.some((m) => m._id.toString() === userId)) {
            role = "MEMBER";
            break;
          }
        }
      }

      return {
        id: team._id,
        name: team.TeamName,
        description: team.Prototype || "",
        head: team.TeamHId?.userName || "—",
        role,
        subprojects: (team.Subteams || []).map((s) => ({
          id: s._id,
          name: s.name,
          description: s.description || "",
          leader: s.headId?.userName || "—",
          members: s.members.map((m) => m.userName),
          tasks: (s.tasks || []).map((t) => ({
            id: t._id,
            title: t.title,
            status: t.status,
            assignee: t.assignee?.userName || "—",
            due: t.dueDate,
          })),
        })),
      };
    });

    res.status(200).json(formatted);
  } catch (err) {
    console.error("Error fetching teams:", err);
    res.status(500).json({ message: err.message });
  }
};



// ✅ Team Head or Subteam Head can invite members (using username)
exports.inviteMember = async (req, res) => {
  try {
    const { teamId, subteamId } = req.params; // subteamId optional
    const { userName } = req.body; // ✅ changed from memberId → userName
    const requesterId = req.user.id;

    // ✅ Find the user to invite by their username
    const userToInvite = await User.findOne({ userName });
    if (!userToInvite) {
      return res.status(404).json({ message: "User with this username not found" });
    }

    const memberId = userToInvite._id; // ✅ internally use ObjectId
    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ message: "Team not found" });

    // ✅ If subteamId provided → check subteam permissions
    if (subteamId) {
      const subteam = await Subteam.findById(subteamId);
      if (!subteam) return res.status(404).json({ message: "Subteam not found" });

      // Ensure subteam belongs to this team
      if (subteam.teamId.toString() !== teamId) {
        return res.status(400).json({ message: "This subteam does not belong to the specified team" });
      }

      const isSubteamHead = subteam.headId?.toString() === requesterId;
      const isTeamHead = team.TeamHId.toString() === requesterId;

      if (!isSubteamHead && !isTeamHead) {
        return res.status(403).json({
          message: "Only Subteam Head or Team Head can invite members to this subteam",
        });
      }

      // ✅ Prevent duplicate invites
      const existingInvite = await Notification.findOne({
        recipientId: memberId,
        teamId,
        type: "SUBTEAM_INVITE",
        status: "Pending",
      });
      if (existingInvite) {
        return res.status(400).json({ message: "User already has a pending invite for this subteam" });
      }

      // ✅ Create notification for subteam invite
      const notification = await Notification.create({
        recipientId: memberId,
        senderId: requesterId,
        teamId,
        type: "SUBTEAM_INVITE",
        message: `You have been invited to join subteam "${subteam.name}" under team "${team.TeamName}".`,
      });

      return res.status(201).json({
        message: `Subteam invitation sent successfully to ${userToInvite.userName}`,
        notification,
      });
    }

    // 🟦 Team-level invite (main team)
    const isTeamHead = team.TeamHId.toString() === requesterId;
    if (!isTeamHead) {
      return res.status(403).json({ message: "Only Team Head can invite members to the main team" });
    }

    // ✅ Prevent duplicate team invites
    const existingInvite = await Notification.findOne({
      recipientId: memberId,
      teamId,
      type: "TEAM_INVITE",
      status: "Pending",
    });
    if (existingInvite) {
      return res.status(400).json({ message: "User already has a pending invite for this team" });
    }

    // ✅ Create notification for team invite
    const notification = await Notification.create({
      recipientId: memberId,
      senderId: requesterId,
      teamId,
      type: "TEAM_INVITE",
      message: `You have been invited to join team "${team.TeamName}".`,
    });

    res.status(201).json({
      message: `Team invitation sent successfully to ${userToInvite.userName}`,
      notification,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// Helper to generate unique team code
function generateTeamCode() {
  const random = Math.floor(10000 + Math.random() * 90000); // 5-digit random number
  return `ALLY#${random}`;
}
