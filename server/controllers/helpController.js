const HelpRequest = require('../models/HelpRequest');
const HelpTransaction = require('../models/HelpTransaction');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { computeHelperMatch } = require('../services/matchingService');
const { awardPoints, getCategoryPoints } = require('../services/rewardService');
const { CITY_COORDINATES } = require('./userController');

// @desc    Create a new help request
// @route   POST /api/help-requests
const createHelpRequest = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      city,
      coordinates, // [lng, lat] optional
      urgency,
      preferredLanguage,
      requiredSkills,
      visibility,
    } = req.body;

    if (!title || !description || !category || !city) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, category, and city are required',
      });
    }

    let locationCoords = coordinates;
    if (!locationCoords || !Array.isArray(locationCoords) || locationCoords.length !== 2) {
      locationCoords = CITY_COORDINATES[city.toLowerCase()] || [77.209, 28.6139];
    }

    const helpRequest = await HelpRequest.create({
      creator: req.user._id,
      title: title.trim(),
      description: description.trim(),
      category,
      city: city.trim(),
      location: {
        type: 'Point',
        coordinates: [Number(locationCoords[0]), Number(locationCoords[1])],
      },
      urgency: urgency || 'Medium',
      preferredLanguage: preferredLanguage || 'Hindi',
      requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : [],
      visibility: visibility || 'public',
      status: 'Open',
    });

    res.status(201).json({
      success: true,
      message: 'Help request created successfully',
      helpRequest,
    });
  } catch (error) {
    console.error('[Create Help Request Error]:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all help requests with filtering & search
// @route   GET /api/help-requests
const getHelpRequests = async (req, res) => {
  try {
    const {
      category,
      city,
      urgency,
      status,
      myRequests,
      search,
      page = 1,
      limit = 20,
    } = req.query;

    const query = {};

    if (myRequests === 'true' && req.user) {
      query.creator = req.user._id;
    } else {
      if (req.user) {
        query.creator = { $ne: req.user._id };
      }
      if (status && status !== 'all') {
        query.status = status;
      } else {
        query.status = { $in: ['Open', 'Matched', 'In Progress'] };
      }
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    if (city && city !== 'all') {
      query.city = { $regex: `^${city.trim()}$`, $options: 'i' };
    }

    if (urgency && urgency !== 'all') {
      query.urgency = urgency;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { requiredSkills: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await HelpRequest.countDocuments(query);
    const helpRequests = await HelpRequest.find(query)
      .populate('creator', 'name avatar currentCity college trustScore rewardPoints badges')
      .populate('acceptedHelper', 'name avatar currentCity trustScore')
      .populate('responses.helper', 'name avatar currentCity trustScore')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    res.status(200).json({
      success: true,
      total,
      page: parseInt(page, 10),
      totalPages: Math.ceil(total / parseInt(limit, 10)),
      helpRequests,
    });
  } catch (error) {
    console.error('[Get Help Requests Error]:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single help request by ID
// @route   GET /api/help-requests/:id
const getHelpRequestById = async (req, res) => {
  try {
    const request = await HelpRequest.findById(req.params.id)
      .populate('creator', 'name avatar currentCity college trustScore rewardPoints badges email phone')
      .populate('acceptedHelper', 'name avatar currentCity trustScore rewardPoints badges phone email')
      .populate('responses.helper', 'name avatar currentCity trustScore badges');

    if (!request) {
      return res.status(404).json({ success: false, message: 'Help request not found' });
    }

    res.status(200).json({
      success: true,
      helpRequest: request,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update/edit help request
// @route   PUT /api/help-requests/:id
const updateHelpRequest = async (req, res) => {
  try {
    const request = await HelpRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Help request not found' });
    }

    if (request.creator.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this request' });
    }

    const {
      title,
      description,
      category,
      city,
      urgency,
      preferredLanguage,
      requiredSkills,
      status,
    } = req.body;

    if (title) request.title = title.trim();
    if (description) request.description = description.trim();
    if (category) request.category = category;
    if (city) request.city = city.trim();
    if (urgency) request.urgency = urgency;
    if (preferredLanguage) request.preferredLanguage = preferredLanguage;
    if (requiredSkills) request.requiredSkills = requiredSkills;
    if (status) request.status = status;

    await request.save();

    res.status(200).json({
      success: true,
      message: 'Help request updated successfully',
      helpRequest: request,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete/cancel help request
// @route   DELETE /api/help-requests/:id
const deleteHelpRequest = async (req, res) => {
  try {
    const request = await HelpRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Help request not found' });
    }

    if (request.creator.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this request' });
    }

    request.status = 'Cancelled';
    await request.save();

    res.status(200).json({
      success: true,
      message: 'Help request cancelled successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Offer/respond to help a request
// @route   POST /api/help-requests/:id/respond
const respondToHelpRequest = async (req, res) => {
  try {
    const { message } = req.body;
    const request = await HelpRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Help request not found' });
    }

    if (request.creator.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot respond to your own request' });
    }

    // Check if already responded
    const alreadyResponded = request.responses.some(
      (r) => r.helper.toString() === req.user._id.toString()
    );

    if (alreadyResponded) {
      return res.status(400).json({ success: false, message: 'You have already offered help for this request' });
    }

    request.responses.push({
      helper: req.user._id,
      message: message || "I'd be glad to help you with this!",
      proposedAt: new Date(),
    });

    if (request.status === 'Open') {
      request.status = 'Matched';
    }

    await request.save();

    // Notify request creator
    const notif = await Notification.create({
      recipient: request.creator,
      sender: req.user._id,
      type: 'help_response',
      title: 'New Helper Response',
      message: `${req.user.name} offered to help with "${request.title}"`,
      link: `/help-requests/${request._id}`,
    });

    const io = req.app.get('io');
    if (io) {
      io.to(`user_${request.creator}`).emit('notification', notif);
    }

    res.status(200).json({
      success: true,
      message: 'Help offer submitted successfully',
      helpRequest: request,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Accept a helper for the request
// @route   POST /api/help-requests/:id/accept
const acceptHelper = async (req, res) => {
  try {
    const { helperId } = req.body;
    const request = await HelpRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Help request not found' });
    }

    if (request.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only creator can accept a helper' });
    }

    request.acceptedHelper = helperId;
    request.status = 'In Progress';
    await request.save();

    // Create a help transaction tracking record
    await HelpTransaction.findOneAndUpdate(
      { helpRequest: request._id, helper: helperId },
      {
        creator: req.user._id,
        helper: helperId,
        category: request.category,
        status: 'in_progress',
      },
      { upsert: true, new: true }
    );

    // Notify helper
    const notif = await Notification.create({
      recipient: helperId,
      sender: req.user._id,
      type: 'helper_accepted',
      title: 'You are accepted as Helper!',
      message: `${req.user.name} accepted your offer to help with "${request.title}"!`,
      link: `/help-requests/${request._id}`,
    });

    const io = req.app.get('io');
    if (io) {
      io.to(`user_${helperId}`).emit('notification', notif);
    }

    res.status(200).json({
      success: true,
      message: 'Helper accepted. Request is now In Progress.',
      helpRequest: request,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Confirm completion and award points
// @route   POST /api/help-requests/:id/complete
const completeHelpRequest = async (req, res) => {
  try {
    const request = await HelpRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Help request not found' });
    }

    if (request.creator.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only the request creator can confirm completion',
      });
    }

    if (!request.acceptedHelper) {
      return res.status(400).json({
        success: false,
        message: 'No helper was assigned to this request',
      });
    }

    if (request.status === 'Completed') {
      return res.status(400).json({
        success: false,
        message: 'Request is already marked as completed',
      });
    }

    request.status = 'Completed';
    request.completedAt = new Date();
    await request.save();

    // Calculate category points strictly on the backend
    const pointsToAward = getCategoryPoints(request.category);

    // Find and update help transaction
    let transaction = await HelpTransaction.findOne({
      helpRequest: request._id,
      helper: request.acceptedHelper,
    });

    if (!transaction) {
      transaction = await HelpTransaction.create({
        helpRequest: request._id,
        creator: req.user._id,
        helper: request.acceptedHelper,
        category: request.category,
        status: 'completed',
        pointsAwarded: pointsToAward,
        isConfirmedByCreator: true,
        confirmedAt: new Date(),
      });
    } else {
      transaction.status = 'completed';
      transaction.pointsAwarded = pointsToAward;
      transaction.isConfirmedByCreator = true;
      transaction.confirmedAt = new Date();
      await transaction.save();
    }

    // Update helper stats: increment helpCompletedCount
    const helperUser = await User.findById(request.acceptedHelper);
    if (helperUser) {
      helperUser.helpCompletedCount = (helperUser.helpCompletedCount || 0) + 1;
      helperUser.trustScore = Math.min(100, (helperUser.trustScore || 80) + 2);
      await helperUser.save();
    }

    // Award points safely with duplicate prevention
    const io = req.app.get('io');
    const rewardResult = await awardPoints({
      userId: request.acceptedHelper,
      amount: pointsToAward,
      action: `Completed Help: ${request.category} ("${request.title.slice(0, 30)}...")`,
      referenceId: request._id.toString(),
      category: request.category,
      io,
    });

    // Notify helper about completion
    const notif = await Notification.create({
      recipient: request.acceptedHelper,
      sender: req.user._id,
      type: 'help_completed',
      title: 'Assistance Confirmed Completed!',
      message: `${req.user.name} confirmed completion of "${request.title}". You earned +${pointsToAward} points!`,
      link: '/rewards',
    });

    if (io) {
      io.to(`user_${request.acceptedHelper}`).emit('notification', notif);
    }

    res.status(200).json({
      success: true,
      message: `Assistance confirmed completed! Helper awarded ${pointsToAward} reward points.`,
      helpRequest: request,
      rewardResult,
    });
  } catch (error) {
    console.error('[Complete Help Request Error]:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Smart Matching: Recommend helpers for a request
// @route   GET /api/help-requests/:id/matches (or /api/matches/:requestId)
const getMatchesForRequest = async (req, res) => {
  try {
    const requestId = req.params.id || req.params.requestId;
    const request = await HelpRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Help request not found' });
    }

    // Find candidate users:
    // Exclude request creator, suspended users, and blocked users
    const query = {
      _id: { $ne: request.creator },
      status: 'active',
      availability: { $ne: 'Unavailable' },
    };

    if (req.user?.blockedUsers?.length > 0) {
      query._id.$nin = req.user.blockedUsers;
    }

    const candidateHelpers = await User.find(query).select(
      '-password -otpCode -otpExpiresAt'
    );

    // Run Smart Matching Engine on each candidate
    const matches = candidateHelpers
      .map((helper) => computeHelperMatch(request, helper))
      .filter((m) => m.matchScore > 20) // Filter out negligible matches
      .sort((a, b) => b.matchScore - a.matchScore) // Highest match first
      .slice(0, 15); // Top 15 recommendations

    res.status(200).json({
      success: true,
      requestId: request._id,
      requestCategory: request.category,
      requestCity: request.city,
      count: matches.length,
      disclaimer:
        'Matching scores are system-generated recommendations based on skill, language, distance, availability, and trust score, not guarantees.',
      matches,
    });
  } catch (error) {
    console.error('[Get Matches Error]:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createHelpRequest,
  getHelpRequests,
  getHelpRequestById,
  updateHelpRequest,
  deleteHelpRequest,
  respondToHelpRequest,
  acceptHelper,
  completeHelpRequest,
  getMatchesForRequest,
};
