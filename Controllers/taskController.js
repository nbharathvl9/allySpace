const Task = require("../models/Task");
const Team = require("../models/Team");
const Subteam = require("../models/Subteam");

// ✅ Assign task (Team Head or Subteam Head)
exports.assignTask = async (req, res) => {
  try {
    const { teamId, subteamId } = req.params;
    const { title, description, assignedTo, deadline } = req.body;
    const requesterId = req.user.id;

    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ message: "Team not found" });

    // Determine if assigning under subteam or team
    let allowed = false;

    if (subteamId) {
      const subteam = await Subteam.findById(subteamId);
      if (!subteam) return res.status(404).json({ message: "Subteam not found" });

      const isSubHead = subteam.headId?.toString() === requesterId;
      const isTeamHead = team.TeamHId.toString() === requesterId;

      if (!isSubHead && !isTeamHead)
        return res.status(403).json({ message: "Not authorized to assign tasks here" });

      // Ensure member belongs to subteam
      if (!subteam.members.includes(assignedTo))
        return res.status(400).json({ message: "User not in this subteam" });

      allowed = true;
    } else {
      // Team-level task
      const isTeamHead = team.TeamHId.toString() === requesterId;
      if (!isTeamHead)
        return res.status(403).json({ message: "Only Team Head can assign tasks at team level" });

      // Ensure member belongs to team
      if (!team.TeamMembers.includes(assignedTo))
        return res.status(400).json({ message: "User not part of this team" });

      allowed = true;
    }

    if (allowed) {
      const task = await Task.create({
        title,
        description,
        assignedTo,
        assignedBy: requesterId,
        teamId,
        subteamId: subteamId || null,
        deadline,
      });

      return res.status(201).json({ message: "Task assigned successfully", task });
    }

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Get all tasks assigned to the logged-in user
exports.getMyTasks = async (req, res) => {
  try {
    const userId = req.user.id;
    const tasks = await Task.find({ assignedTo: userId })
      .populate("teamId", "TeamName")
      .populate("subteamId", "name")
      .populate("assignedBy", "userName");
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Update task status (assigned user updates progress)
exports.updateTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    if (task.assignedTo.toString() !== userId)
      return res.status(403).json({ message: "You can only update your own tasks" });

    task.status = status;
    await task.save();
    res.json({ message: "Task status updated", task });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
