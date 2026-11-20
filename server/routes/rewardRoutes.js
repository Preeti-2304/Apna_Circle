const express = require('express');
const router = express.Router();
const {
  getRewardsDashboard,
  getLeaderboard,
  getRewardHistory,
} = require('../controllers/rewardController');
const { protect, optionalAuth } = require('../middleware/auth');

router.get('/leaderboard', optionalAuth, getLeaderboard);
router.get('/', protect, getRewardsDashboard);
router.get('/history', protect, getRewardHistory);

module.exports = router;
