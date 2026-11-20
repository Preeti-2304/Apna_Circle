const User = require('../models/User');
const Friendship = require('../models/Friendship');
const HelpRequest = require('../models/HelpRequest');
const HelpTransaction = require('../models/HelpTransaction');
const RewardTransaction = require('../models/RewardTransaction');
const Community = require('../models/Community');
const Report = require('../models/Report');
const Review = require('../models/Review');

// @desc    Admin dashboard statistics
// @route   GET /api/admin/dashboard
const getAdminDashboard = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ status: 'active' });
    const suspendedUsers = await User.countDocuments({ status: 'suspended' });
    const totalFriendships = await Friendship.countDocuments();
    const totalHelpRequests = await HelpRequest.countDocuments();
    const completedHelpRequests = await HelpRequest.countDocuments({ status: 'Completed' });
    const totalCommunities = await Community.countDocuments();
    const pendingReports = await Report.countDocuments({ status: 'pending' });

    // Aggregate total reward points issued
    const rewardAggregation = await RewardTransaction.aggregate([
      { $match: { type: { $in: ['EARNED', 'BONUS'] } } },
      { $group: { _id: null, totalPoints: { $sum: '$amount' } } },
    ]);
    const totalRewardPoints = rewardAggregation[0]?.totalPoints || 0;

    // Recent activity feeds
    const recentUsers = await User.find()
      .select('name email currentCity role status createdAt trustScore rewardPoints')
      .sort({ createdAt: -1 })
      .limit(6);

    const recentRequests = await HelpRequest.find()
      .populate('creator', 'name')
      .sort({ createdAt: -1 })
      .limit(6);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        suspendedUsers,
        totalFriendships,
        totalHelpRequests,
        completedHelpRequests,
        totalCommunities,
        totalRewardPoints,
        pendingReports,
      },
      recentUsers,
      recentRequests,
    });
  } catch (error) {
    console.error('[Admin Dashboard Error]:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all users with filtering for admin
// @route   GET /api/admin/users
const getAdminUsers = async (req, res) => {
  try {
    const { search, status, role, page = 1, limit = 20 } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { currentCity: { $regex: search, $options: 'i' } },
      ];
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    if (role && role !== 'all') {
      query.role = role;
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password -otpCode -otpExpiresAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    res.status(200).json({
      success: true,
      total,
      page: parseInt(page, 10),
      totalPages: Math.ceil(total / parseInt(limit, 10)),
      users,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Change user status (active / suspended) or role
// @route   PUT /api/admin/users/:id/status
const updateUserStatus = async (req, res) => {
  try {
    const { status, role } = req.body;
    const target = await User.findById(req.params.id);

    if (!target) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (status) {
      target.status = status;
    }
    if (role) {
      target.role = role;
    }

    await target.save();

    res.status(200).json({
      success: true,
      message: `User status updated to ${target.status}`,
      user: target,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Submit a report (by user)
// @route   POST /api/reports
const submitReport = async (req, res) => {
  try {
    const { reportedUserId, targetType, targetId, reason, details } = req.body;

    if (!targetType || !targetId || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Target type, target ID, and reason are required',
      });
    }

    const report = await Report.create({
      reporter: req.user._id,
      reportedUser: reportedUserId || null,
      targetType,
      targetId,
      reason,
      details: details || '',
      status: 'pending',
    });

    res.status(201).json({
      success: true,
      message: 'Report submitted. Our moderators will review it shortly.',
      report,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get reports for admin
// @route   GET /api/admin/reports
const getReports = async (req, res) => {
  try {
    const { status = 'pending' } = req.query;
    const query = {};
    if (status !== 'all') {
      query.status = status;
    }

    const reports = await Report.find(query)
      .populate('reporter', 'name email currentCity')
      .populate('reportedUser', 'name email currentCity status')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reports.length,
      reports,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Resolve or dismiss a report
// @route   PUT /api/admin/reports/:id/resolve
const resolveReport = async (req, res) => {
  try {
    const { status, resolutionNotes, suspendUser } = req.body;
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    report.status = status || 'resolved';
    report.resolutionNotes = resolutionNotes || '';
    await report.save();

    if (suspendUser && report.reportedUser) {
      await User.findByIdAndUpdate(report.reportedUser, { status: 'suspended' });
    }

    res.status(200).json({
      success: true,
      message: 'Report updated successfully',
      report,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAdminDashboard,
  getAdminUsers,
  updateUserStatus,
  submitReport,
  getReports,
  resolveReport,
};
