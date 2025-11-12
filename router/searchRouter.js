const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const searchController = require("../Controllers/searchController");

// 🔍 Search by team/subteam code
router.get("/code/:code", auth, searchController.searchByCode);

// 👤 Search members
router.get("/members", auth, searchController.searchMembers);

module.exports = router;
