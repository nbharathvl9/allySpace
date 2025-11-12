const mongoose = require("mongoose");
const Team = require("../models/Team");
const Subteam = require("../models/Subteam");

// ✅ Create Subteam inside a Team
exports.createSubteam = async (req, res) => {
  try {
    // ✅ Extract info
    const userId = req.user?.id; // Ensure middleware sets this
    const { teamId } = req.params;
    const { name, description } = req.body;

    console.log("🔍 Incoming createSubteam");
    console.log("Team ID:", teamId);
    console.log("User ID:", userId);
    console.log("Body:", req.body);

    // ✅ 1. Validate request data
    if (!name || !description) {
      return res.status(400).json({ message: "Name and description are required." });
    }

    // ✅ 2. Check authentication
    if (!userId) {
      return res.status(401).json({ message: "Authentication required. Token missing or invalid." });
    }

    // ✅ 3. Find parent team
    const team = await Team.findById(teamId);
    if (!team) {
      console.log("❌ Team not found for ID:", teamId);
      return res.status(404).json({ message: "Team not found" });
    }

    console.log("✅ Found team:", team.TeamName);
    console.log("🧠 Team Head ID:", team.TeamHId?.toString());
    console.log("🧑‍💼 Requester ID:", userId);

    // ✅ 4. Only the team head can create subteams
    if (team.TeamHId?.toString() !== userId) {
      console.log("🚫 Not authorized to create subteam");
      return res.status(403).json({ message: "Only Team Head can create subteams." });
    }

    // ✅ 5. Create the new subteam
    const subteam = new Subteam({
      name,
      description,
      headId: userId,
      teamId: team._id,
      members: [userId],
    });

    await subteam.save();

    // ✅ 6. Link subteam to its parent team
    await Team.findByIdAndUpdate(teamId, {
      $addToSet: { Subteams: subteam._id }, // Field name must match Team schema
    });

    console.log("✅ Subteam created successfully:", subteam.name);

    // ✅ 7. Send clean success response
    res.status(201).json({
      message: "Subteam created successfully",
      subteam,
    });

  } catch (err) {
    console.error("🔥 createSubteam error:", err);
    res.status(500).json({ message: "Server error creating subteam", error: err.message });
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
    const { memberId, memberUsername } = req.body; // accept either
    const requester = req.user.id;

    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ message: "Team not found" });

    const subteam = await Subteam.findById(subteamId);
    if (!subteam) return res.status(404).json({ message: "Subteam not found" });

    const isTeamHead = team.TeamHId.toString() === requester;
    const isSubHead = subteam.headId && subteam.headId.toString() === requester;
    if (!isTeamHead && !isSubHead) {
      return res.status(403).json({ message: "Only Team Head or Subteam Head can add members" });
    }

    // resolve username -> id if needed
    let userToAddId = memberId;
    if (!userToAddId && memberUsername) {
      const uname = memberUsername.replace("@", "");
      const user = await User.findOne({ userName: uname });
      if (!user) return res.status(404).json({ message: "User not found by username" });
      userToAddId = user._id;
    }
    if (!userToAddId) return res.status(400).json({ message: "memberId or memberUsername required" });

    if (subteam.members.map(m => m.toString()).includes(userToAddId.toString())) {
      return res.status(400).json({ message: "User already exists in subteam" });
    }

    subteam.members.push(userToAddId);
    await subteam.save();

    if (!team.TeamMembers.map(m=>m.toString()).includes(userToAddId.toString())) {
      team.TeamMembers.push(userToAddId);
      await team.save();
    }

    // return populated member userNames to frontend
    await subteam.populate("members", "userName");
    const membersUsernames = subteam.members.map(m => m.userName);

    res.json({ message: "Member added successfully", members: membersUsernames });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Remove a member from Subteam
// replace existing removeMemberFromSubteam
exports.removeMemberFromSubteam = async (req, res) => {
  try {
    const { teamId, subteamId, memberId } = req.params; // memberId may be username
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

    let resolvedId = memberId;
    // if memberId is not ObjectId-looking, treat as username
    if (!/^[0-9a-fA-F]{24}$/.test(memberId)) {
      const uname = memberId.replace("@", "");
      const user = await User.findOne({ userName: uname });
      if (!user) return res.status(404).json({ message: "User not found" });
      resolvedId = user._id.toString();
    }

    subteam.members = subteam.members.filter((id) => id.toString() !== resolvedId);
    await subteam.save();

    await subteam.populate("members", "userName");
    const membersUsernames = subteam.members.map(m => m.userName);

    res.json({ message: "Member removed successfully", members: membersUsernames });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ✅ Get all Subteams under a Team
exports.getSubteams = async (req, res) => {
  try {
    const { teamId } = req.params;

    // ✅ Find all subteams belonging to a team
    const subteams = await Subteam.find({ teamId })
      .populate("headId", "userName email")          // Populate subteam head details
      .populate("members", "userName email")         // Populate member details
      .populate({
        path: "tasks",                               // Populate tasks
        select: "title status assignee dueDate",     // Select only required fields
        populate: {
          path: "assignee",
          select: "userName email",                  // Include assignee info
        },
      });

    // ✅ Optional: Format the data for frontend readability
    const formatted = subteams.map((sub) => ({
      id: sub._id,
      name: sub.name,
      description: sub.description,
      leader: sub.headId ? sub.headId.userName : "—",
      members: sub.members.map((m) => m.userName),
      tasks: sub.tasks.map((t) => ({
        id: t._id,
        title: t.title,
        status: t.status,
        assignee: t.assignee ? t.assignee.userName : "—",
        due: t.dueDate ? new Date(t.dueDate).toISOString().split("T")[0] : "—",
      })),
    }));

    // ✅ Return as JSON (for React frontend)
    res.status(200).json({
      teamId,
      totalSubteams: formatted.length,
      subteams: formatted,
    });

    // ✅ (If you prefer to render it on EJS server-side)
    // res.render("subteams", { teamId, subteams: formatted });

  } catch (err) {
    console.error("Error fetching subteams:", err);
    res.status(500).json({ message: "Server error while fetching subteams" });
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
// ✅ Delete Subteam
exports.deleteSubteam = async (req, res) => {
  try {
    const { teamId, subteamId } = req.params;
    const requester = req.user.id;

    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ message: "Team not found" });

    const subteam = await Subteam.findById(subteamId);
    if (!subteam) return res.status(404).json({ message: "Subteam not found" });

    if (team.TeamHId.toString() !== requester)
      return res.status(403).json({ message: "Only Team Head can delete subteams" });

    await Subteam.findByIdAndDelete(subteamId);
    res.json({ message: "Subteam deleted successfully" });
  } catch (err) {
    console.error("Error deleting subteam:", err);
    res.status(500).json({ message: err.message });
  }
};



