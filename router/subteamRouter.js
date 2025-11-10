const express = require("express");
const router = express.Router({ mergeParams: true }); // allows :teamId from parent
const auth = require("../middleware/authMiddleware");
const subteamController = require("../controllers/subteamController");

// ✅ Create Subteam under a Team
router.post("/:teamId/subteams", auth, subteamController.createSubteam);

// ✅ Get all Subteams under a Team
router.get("/:teamId/subteams", auth, subteamController.getSubteams);

// ✅ Get specific Subteam by ID
router.get("/:teamId/subteams/:subteamId", auth, subteamController.getSubteamById);

// ✅ Add Member to a Subteam
router.post("/:teamId/subteams/:subteamId/add-member", auth, subteamController.addMemberToSubteam);

// ✅ Remove Member from a Subteam
router.delete("/:teamId/subteams/:subteamId/remove-member/:memberId", auth, subteamController.removeMemberFromSubteam);

module.exports = router;
