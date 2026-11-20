const RewardTransaction = require('../models/RewardTransaction');
const User = require('../models/User');

// @desc    Get user's rewards dashboard data
// @route   GET /api/rewards
const getRewardsDashboard = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    // Fetch transactions
    const transactions = await RewardTransaction.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(30);

    // Calculate aggregations
    const earnedTotal = transactions
      .filter((t) => t.type === 'EARNED' || t.type === 'BONUS')
      .reduce((sum, t) => sum + t.amount, 0);

    const redeemedTotal = transactions
      .filter((t) => t.type === 'REDEEMED')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    // Available level thresholds
    const levelThresholds = [
      { level: 1, name: 'New Member', minPoints: 0, maxPoints: 99 },
      { level: 2, name: 'Active Member', minPoints: 100, maxPoints: 249 },
      { level: 3, name: 'Community Helper', minPoints: 250, maxPoints: 499 },
      { level: 4, name: 'Trusted Helper', minPoints: 500, maxPoints: 999 },
      { level: 5, name: 'Community Champion', minPoints: 1000, maxPoints: '+' },
    ];

    const currentLevelInfo =
      levelThresholds.find((l) => l.level === (user.level || 1)) || levelThresholds[0];

    // Next level progress
    let nextLevelProgress = 100;
    if (user.level < 5) {
      const nextLvl = levelThresholds[user.level];
      const range = nextLvl.minPoints - currentLevelInfo.minPoints;
      const progress = user.rewardPoints - currentLevelInfo.minPoints;
      nextLevelProgress = Math.min(100, Math.max(0, Math.round((progress / range) * 100)));
    }

    res.status(200).json({
      success: true,
      points: user.rewardPoints || 0,
      earnedTotal,
      redeemedTotal,
      level: user.level || 1,
      levelName: currentLevelInfo.name,
      nextLevelProgress,
      badges: user.badges || [],
      helpCompletedCount: user.helpCompletedCount || 0,
      transactions,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get leaderboards (overall, city-wise, monthly)
// @route   GET /api/rewards/leaderboard
const getLeaderboard = async (req, res) => {
  try {
    const { type = 'overall', city } = req.query;

    const query = { status: 'active' };

    if (type === 'city' && city) {
      query.currentCity = { $regex: `^${city.trim()}$`, $options: 'i' };
    }

    const leaderboard = await User.find(query)
      .select('name avatar currentCity college profession trustScore rewardPoints level helpCompletedCount badges')
      .sort({ rewardPoints: -1, helpCompletedCount: -1, trustScore: -1 })
      .limit(25)
      .lean();

    // Attach rank
    leaderboard.forEach((u, idx) => {
      u.rank = idx + 1;
    });

    res.status(200).json({
      success: true,
      type,
      city: city || 'All Cities',
      count: leaderboard.length,
      leaderboard,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get rewards history
// @route   GET /api/rewards/history
const getRewardHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const history = await RewardTransaction.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      count: history.length,
      history,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getRewardsDashboard,
  getLeaderboard,
  getRewardHistory,
};
