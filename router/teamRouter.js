const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const teamController = require('../Controllers/teamController');

router.post('/create', auth, teamController.createTeam);
router.get('/my-teams', auth, teamController.getMyTeams);
router.get('/:teamId', auth, teamController.getTeamHierarchy);

module.exports = router;
