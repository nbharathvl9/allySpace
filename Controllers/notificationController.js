const Notification = require("../models/Notification");
const Team = require("../models/Team");
const Subteam = require("../models/Subteam");

// ✅ Get all notifications for the logged-in user
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    const notifications = await Notification.find({ recipientId: userId })
      .populate("teamId", "TeamName")
      .populate("senderId", "userName")
      .sort({ createdAt: -1 });

    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Respond to invitation (Accept or Reject)
exports.respondToInvite = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const { response } = req.body; // "Accepted" or "Rejected"
    const userId = req.user.id;

    // Find the notification
    const notification = await Notification.findById(notificationId);
    if (!notification) return res.status(404).json({ message: "Notification not found" });

    // Ensure user owns this notification
    if (notification.recipientId.toString() !== userId)
      return res.status(403).json({ message: "Not your invitation" });

    // Update notification
    notification.status = response;
    notification.isRead = true;
    await notification.save();

    // If user accepts, update the corresponding team/subteam
    if (response === "Accepted") {
      if (notification.type === "TEAM_INVITE") {
        // Add user to team
        await Team.findByIdAndUpdate(notification.teamId, {
          $addToSet: { TeamMembers: userId },
        });
      }

      if (notification.type === "SUBTEAM_INVITE") {
        // Find subteam by matching teamId + recipient
        const subteam = await Subteam.findOne({
          teamId: notification.teamId,
          members: { $ne: userId }, // not already a member
        });

        if (subteam) {
          await Subteam.findByIdAndUpdate(subteam._id, {
            $addToSet: { members: userId },
          });
        } else {
          return res.status(404).json({ message: "Subteam not found for this invite" });
        }
      }
    }

    res.json({ message: `Invitation ${response}`, notification });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
