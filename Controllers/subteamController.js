const mongoose = require("mongoose");
const Team = require("../models/Team");
const Subteam = require("../models/Subteam");

// ✅ Create Subteam inside a Team
exports.createSubteam = async (req, res) => {
  try {
    const userId = req.user.id; // logged-in user (Team Head)
    const { teamId } = req.params;
    const { name, description } = req.body;

    // Check if team exists
    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ message: "Team not found" });

    // Only Team Head can create subteams
    if (team.TeamHId.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "Only Team Head can create subteams" });
    }

    // ✅ Assign the creator as subteam head automatically
    const subteam = new Subteam({
      name,
      teamId,
      headId: userId,
      members: [userId], // optional: auto-add subteam head as first member
      description,
    });

    await subteam.save();

    res
      .status(201)
      .json({ message: "Subteam created successfully", subteam });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Assign or change Subteam Head (only Team Head can do this)
exports.assignSubteamHead = async (req, res) => {
  try {
    const { teamId, subteamId } = req.params;
    const { newHeadId } = req.body;
    const userId = req.user.id;

    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ message: "Team not found" });

    if (team.TeamHId.toString() !== userId)
      return res.status(403).json({ message: "Only Team Head can assign Subteam Head" });

    const subteam = await Subteam.findById(subteamId);
    if (!subteam) return res.status(404).json({ message: "Subteam not found" });

    subteam.headId = newHeadId;
    if (!subteam.members.includes(newHeadId)) subteam.members.push(newHeadId);

    await subteam.save();
    res.json({ message: "Subteam Head assigned successfully", subteam });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ✅ Add a member to a Subteam
exports.addMemberToSubteam = async (req, res) => {
  try {
    const { teamId, subteamId } = req.params;
    const { memberId } = req.body;
    const requester = req.user.id;

    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ message: "Team not found" });

    const subteam = await Subteam.findById(subteamId);
    if (!subteam) return res.status(404).json({ message: "Subteam not found" });

    // Permission check → Team Head or Subteam Head only
    const isTeamHead = team.TeamHId.toString() === requester;
    const isSubHead = subteam.headId && subteam.headId.toString() === requester;
    if (!isTeamHead && !isSubHead) {
      return res.status(403).json({ message: "Only Team Head or Subteam Head can add members" });
    }

    // Prevent duplicate members
    if (subteam.members.includes(memberId)) {
      return res.status(400).json({ message: "User already exists in subteam" });
    }

    // Add to subteam
    subteam.members.push(memberId);
    await subteam.save();

    // Also ensure that this user is part of the parent team
    if (!team.TeamMembers.includes(memberId)) {
      team.TeamMembers.push(memberId);
      await team.save();
    }

    res.json({ message: "Member added successfully", subteam });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Remove a member from Subteam
exports.removeMemberFromSubteam = async (req, res) => {
  try {
    const { teamId, subteamId, memberId } = req.params;
    const requester = req.user.id;

    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ message: "Team not found" });

    const subteam = await Subteam.findById(subteamId);
    if (!subteam) return res.status(404).json({ message: "Subteam not found" });

    const isTeamHead = team.TeamHId.toString() === requester;
    const isSubHead = subteam.headId && subteam.headId.toString() === requester;
    if (!isTeamHead && !isSubHead) {
      return res.status(403).json({ message: "Only Team Head or Subteam Head can remove members" });
    }

    subteam.members = subteam.members.filter(
      (id) => id.toString() !== memberId
    );
    await subteam.save();

    res.json({ message: "Member removed successfully", subteam });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Get all Subteams under a Team
exports.getSubteams = async (req, res) => {
  try {
    const { teamId } = req.params;
    const subteams = await Subteam.find({ teamId })
      .populate("headId", "userName email")
      .populate("members", "userName email");
    res.json(subteams);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Get a specific Subteam and its Members
exports.getSubteamById = async (req, res) => {
  try {
    const { subteamId } = req.params;
    const subteam = await Subteam.findById(subteamId)
      .populate("headId", "userName email")
      .populate("members", "userName email");
    if (!subteam) return res.status(404).json({ message: "Subteam not found" });
    res.json(subteam);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
