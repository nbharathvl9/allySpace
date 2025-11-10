const express = require("express");
const router = express.Router({ mergeParams: true });
const auth = require("../middleware/authMiddleware");
const taskController = require("../Controllers/taskController");

// Assign task (Team Head or Subteam Head)
router.post("/:teamId/tasks", auth, taskController.assignTask);                     // team-level task
router.post("/:teamId/subteams/:subteamId/tasks", auth, taskController.assignTask); // subteam-level task

// View tasks
router.get("/my-tasks", auth, taskController.getMyTasks);

// Update status
router.put("/task/:taskId/status", auth, taskController.updateTaskStatus);

module.exports = router;
