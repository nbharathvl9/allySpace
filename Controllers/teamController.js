const Team = require('../models/Team');
const Subteam = require('../models/Subteam');

// create top-level team
exports.createTeam = async (req, res) => {
  try {
    const userId = req.user.id;
    const { TeamName, Prototype } = req.body;
    const team = new Team({ TeamName, TeamHId: userId, TeamMembers: [userId], Prototype });
    await team.save();
    res.status(201).json({ message: 'Team created', team });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// get team with its subteams (hierarchy)
exports.getTeamHierarchy = async (req, res) => {
  try {
    const { teamId } = req.params;
    const team = await Team.findById(teamId).populate('TeamHId', 'userName email').lean();
    if (!team) return res.status(404).json({ message: 'Team not found' });

    const subteams = await Subteam.find({ teamId }).populate('headId', 'userName email').lean();
    team.subteams = subteams;
    res.json(team);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// get teams where user is member or head
exports.getMyTeams = async (req, res) => {
  try {
    const userId = req.user.id;
    const teams = await Team.find({
      $or: [{ TeamHId: userId }, { TeamMembers: userId }]
    }).lean();
    res.json(teams);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
