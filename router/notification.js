const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const notificationController = require("../Controllers/notificationController");

// Get all notifications
router.get("/", auth, notificationController.getNotifications);

// Respond (Accept / Reject)
router.put("/:notificationId/respond", auth, notificationController.respondToInvite);

module.exports = router;
