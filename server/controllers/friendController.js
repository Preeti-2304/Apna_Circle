const FriendRequest = require('../models/FriendRequest');
const Friendship = require('../models/Friendship');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { calculateDistanceKm } = require('../services/matchingService');

// @desc    Send a friend request
// @route   POST /api/friends/request/:userId
const sendFriendRequest = async (req, res) => {
  try {
    const senderId = req.user._id;
    const recipientId = req.params.userId;

    if (senderId.toString() === recipientId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot send a friend request to yourself',
      });
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check if blocked
    if (
      recipient.blockedUsers?.includes(senderId) ||
      req.user.blockedUsers?.includes(recipientId)
    ) {
      return res.status(403).json({
        success: false,
        message: 'Unable to send friend request to this user',
      });
    }

    // Check if already friends
    const existingFriendship = await Friendship.findOne({
      $or: [
        { user1: senderId, user2: recipientId },
        { user1: recipientId, user2: senderId },
      ],
    });
    if (existingFriendship) {
      return res.status(400).json({
        success: false,
        message: 'You are already friends with this user',
      });
    }

    // Check existing request
    const existingRequest = await FriendRequest.findOne({
      $or: [
        { sender: senderId, recipient: recipientId, status: 'pending' },
        { sender: recipientId, recipient: senderId, status: 'pending' },
      ],
    });

    if (existingRequest) {
      if (existingRequest.sender.toString() === senderId.toString()) {
        return res.status(400).json({
          success: false,
          message: 'Friend request already sent and pending',
        });
      } else {
        // Automatically accept if reverse pending request exists
        existingRequest.status = 'accepted';
        await existingRequest.save();

        const [u1, u2] = [senderId, recipientId].sort();
        const friendship = await Friendship.create({
          user1: u1,
          user2: u2,
          users: [senderId, recipientId],
        });

        return res.status(200).json({
          success: true,
          message: 'Reciprocal friend request accepted! You are now friends.',
          friendship,
        });
      }
    }

    const request = await FriendRequest.create({
      sender: senderId,
      recipient: recipientId,
      status: 'pending',
    });

    // Notify recipient
    const notif = await Notification.create({
      recipient: recipientId,
      sender: senderId,
      type: 'friend_request',
      title: 'New Friend Request',
      message: `${req.user.name} sent you a friend request.`,
      link: '/friends/requests',
    });

    const io = req.app.get('io');
    if (io) {
      io.to(`user_${recipientId}`).emit('notification', notif);
    }

    res.status(201).json({
      success: true,
      message: 'Friend request sent successfully',
      request,
    });
  } catch (error) {
    console.error('[Send Friend Request Error]:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get pending friend requests (received and sent)
// @route   GET /api/friends/requests
const getFriendRequests = async (req, res) => {
  try {
    const userId = req.user._id;

    const received = await FriendRequest.find({
      recipient: userId,
      status: 'pending',
    })
      .populate('sender', 'name avatar currentCity originallyFrom college profession skills trustScore')
      .sort({ createdAt: -1 });

    const sent = await FriendRequest.find({
      sender: userId,
      status: 'pending',
    })
      .populate('recipient', 'name avatar currentCity originallyFrom college profession skills trustScore')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      received,
      sent,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Accept friend request
// @route   POST /api/friends/accept/:requestId
const acceptFriendRequest = async (req, res) => {
  try {
    const userId = req.user._id;
    const request = await FriendRequest.findById(req.params.requestId);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    if (request.recipient.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to accept this friend request',
      });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Request is already ${request.status}`,
      });
    }

    request.status = 'accepted';
    await request.save();

    // Create unique friendship
    const [u1, u2] = [request.sender, request.recipient].sort();
    let friendship = await Friendship.findOne({ user1: u1, user2: u2 });
    if (!friendship) {
      friendship = await Friendship.create({
        user1: u1,
        user2: u2,
        users: [request.sender, request.recipient],
      });
    }

    // Notify sender
    const notif = await Notification.create({
      recipient: request.sender,
      sender: userId,
      type: 'friend_accepted',
      title: 'Friend Request Accepted',
      message: `${req.user.name} accepted your friend request.`,
      link: '/friends',
    });

    const io = req.app.get('io');
    if (io) {
      io.to(`user_${request.sender}`).emit('notification', notif);
    }

    res.status(200).json({
      success: true,
      message: 'Friend request accepted successfully',
      friendship,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reject friend request
// @route   POST /api/friends/reject/:requestId
const rejectFriendRequest = async (req, res) => {
  try {
    const userId = req.user._id;
    const request = await FriendRequest.findById(req.params.requestId);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    if (request.recipient.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to reject this request',
      });
    }

    request.status = 'rejected';
    await request.save();

    res.status(200).json({
      success: true,
      message: 'Friend request rejected',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cancel sent friend request
// @route   POST /api/friends/cancel/:requestId
const cancelFriendRequest = async (req, res) => {
  try {
    const userId = req.user._id;
    const request = await FriendRequest.findById(req.params.requestId);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    if (request.sender.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this request',
      });
    }

    request.status = 'cancelled';
    await request.save();

    res.status(200).json({
      success: true,
      message: 'Friend request cancelled',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Remove friend (unfriend)
// @route   DELETE /api/friends/:userId
const removeFriend = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const targetUserId = req.params.userId;

    const result = await Friendship.deleteMany({
      $or: [
        { user1: currentUserId, user2: targetUserId },
        { user1: targetUserId, user2: currentUserId },
      ],
    });

    // Also update any pending/accepted friend requests
    await FriendRequest.updateMany(
      {
        $or: [
          { sender: currentUserId, recipient: targetUserId },
          { sender: targetUserId, recipient: currentUserId },
        ],
      },
      { status: 'cancelled' }
    );

    res.status(200).json({
      success: true,
      message: 'Friend removed successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user's friends with city, college, skills, category filters & sorting
// @route   GET /api/friends
const getFriends = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      city,
      fromCity,
      college,
      skill,
      category,
      search,
      sortBy = 'recent',
    } = req.query;

    // Find all accepted friendships
    const friendships = await Friendship.find({
      users: userId,
      status: 'accepted',
    }).populate({
      path: 'users',
      select: '-password -otpCode -otpExpiresAt',
    });

    // Extract friend object (the user who isn't the logged in user)
    let friends = friendships.map((f) => {
      const friendObj = f.users.find(
        (u) => u._id.toString() !== userId.toString()
      );
      return {
        ...friendObj.toObject(),
        friendshipId: f._id,
        connectedAt: f.createdAt,
      };
    });

    // Apply Filters
    if (city && city !== 'all') {
      friends = friends.filter(
        (f) => f.currentCity && f.currentCity.toLowerCase() === city.trim().toLowerCase()
      );
    }

    if (fromCity && fromCity !== 'all') {
      friends = friends.filter(
        (f) =>
          f.originallyFrom?.city &&
          f.originallyFrom.city.toLowerCase() === fromCity.trim().toLowerCase()
      );
    }

    if (college && college !== 'all') {
      friends = friends.filter(
        (f) => f.college && f.college.toLowerCase().includes(college.trim().toLowerCase())
      );
    }

    if (skill && skill !== 'all') {
      friends = friends.filter((f) =>
        f.skills?.some((s) => s.toLowerCase().includes(skill.trim().toLowerCase()))
      );
    }

    if (category && category !== 'all') {
      friends = friends.filter((f) =>
        f.canHelpCategories?.some((c) =>
          c.toLowerCase().includes(category.trim().toLowerCase())
        )
      );
    }

    if (search) {
      const s = search.toLowerCase();
      friends = friends.filter(
        (f) =>
          f.name.toLowerCase().includes(s) ||
          (f.currentCity && f.currentCity.toLowerCase().includes(s)) ||
          (f.college && f.college.toLowerCase().includes(s)) ||
          (f.skills && f.skills.some((sk) => sk.toLowerCase().includes(s)))
      );
    }

    // Calculate approximate distance if current user has location
    const userCoords = req.user.location?.coordinates;
    friends.forEach((f) => {
      if (
        userCoords &&
        f.location?.coordinates &&
        !f.hideLiveLocation
      ) {
        f.distanceKm = calculateDistanceKm(
          userCoords[1],
          userCoords[0],
          f.location.coordinates[1],
          f.location.coordinates[0]
        );
      }
    });

    // Apply Sorting
    if (sortBy === 'highest_trust') {
      friends.sort((a, b) => (b.trustScore || 0) - (a.trustScore || 0));
    } else if (sortBy === 'most_helpful') {
      friends.sort((a, b) => (b.helpCompletedCount || 0) - (a.helpCompletedCount || 0));
    } else if (sortBy === 'distance') {
      friends.sort((a, b) => (a.distanceKm || 99999) - (b.distanceKm || 99999));
    } else {
      // 'recent'
      friends.sort((a, b) => new Date(b.connectedAt) - new Date(a.connectedAt));
    }

    // Distinct list of cities among friends for filter dropdown
    const availableCities = [
      ...new Set(
        friendships
          .map((f) => {
            const friendObj = f.users.find(
              (u) => u._id.toString() !== userId.toString()
            );
            return friendObj?.currentCity;
          })
          .filter(Boolean)
      ),
    ];

    res.status(200).json({
      success: true,
      total: friends.length,
      availableCities,
      friends,
    });
  } catch (error) {
    console.error('[Get Friends Error]:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get friends of friends (2nd degree connections)
// @route   GET /api/friends/of-friends
const getFriendsOfFriends = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Get user's direct friends
    const directFriendships = await Friendship.find({
      users: userId,
      status: 'accepted',
    });
    const directFriendIds = directFriendships.map((f) => {
      const otherId = f.users.find((u) => u.toString() !== userId.toString());
      return otherId.toString();
    });

    if (directFriendIds.length === 0) {
      return res.status(200).json({
        success: true,
        friendsOfFriends: [],
        message: 'Add friends to discover 2nd degree connections',
      });
    }

    // 2. Find friendships of direct friends
    const secondaryFriendships = await Friendship.find({
      users: { $in: directFriendIds },
      status: 'accepted',
    }).populate('users', 'name avatar currentCity originallyFrom college profession skills trustScore');

    // 3. Collect 2nd degree connections
    const mapOfSecondDegree = new Map();

    secondaryFriendships.forEach((sf) => {
      sf.users.forEach((u) => {
        const uId = u._id.toString();
        // Skip if self or direct friend
        if (uId === userId.toString() || directFriendIds.includes(uId)) {
          return;
        }

        // Identify mutual friend
        const mutualFriend = sf.users.find((mf) =>
          directFriendIds.includes(mf._id.toString())
        );

        if (!mapOfSecondDegree.has(uId)) {
          mapOfSecondDegree.set(uId, {
            ...u.toObject(),
            relationshipDegree: 'Friend of Friend',
            mutualFriends: mutualFriend ? [mutualFriend.name] : [],
          });
        } else {
          const entry = mapOfSecondDegree.get(uId);
          if (
            mutualFriend &&
            !entry.mutualFriends.includes(mutualFriend.name)
          ) {
            entry.mutualFriends.push(mutualFriend.name);
          }
        }
      });
    });

    const friendsOfFriends = Array.from(mapOfSecondDegree.values()).slice(0, 30);

    res.status(200).json({
      success: true,
      count: friendsOfFriends.length,
      friendsOfFriends,
    });
  } catch (error) {
    console.error('[Friends of Friends Error]:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  sendFriendRequest,
  getFriendRequests,
  acceptFriendRequest,
  rejectFriendRequest,
  cancelFriendRequest,
  removeFriend,
  getFriends,
  getFriendsOfFriends,
};
