const express = require("express");
const router = express.Router({ mergeParams: true });
const auth = require("../middleware/authMiddleware");
const taskController = require("../controllers/taskController");

// Assign task
router.post("/:teamId/tasks", auth, taskController.assignTask); // Team Head
router.post("/:teamId/subteams/:subteamId/tasks", auth, taskController.assignTask); // Subteam Head

// View own tasks
router.get("/my-tasks", auth, taskController.getMyTasks);

// Update task status
router.put("/:taskId/status", auth, taskController.updateTaskStatus);

module.exports = router;
