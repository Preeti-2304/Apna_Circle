const Community = require('../models/Community');
const CommunityMember = require('../models/CommunityMember');
const CommunityPost = require('../models/CommunityPost');

// @desc    Get communities with search & filtering
// @route   GET /api/communities
const getCommunities = async (req, res) => {
  try {
    const { city, category, search } = req.query;
    const query = {};

    if (city && city !== 'all') {
      query.city = { $regex: `^${city.trim()}$`, $options: 'i' };
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const communities = await Community.find(query)
      .populate('creator', 'name avatar')
      .sort({ memberCount: -1, createdAt: -1 });

    // Check user membership if logged in
    let userCommunityIds = [];
    if (req.user) {
      const memberships = await CommunityMember.find({ user: req.user._id });
      userCommunityIds = memberships.map((m) => m.community.toString());
    }

    const enriched = communities.map((c) => ({
      ...c.toObject(),
      isMember: userCommunityIds.includes(c._id.toString()),
    }));

    res.status(200).json({
      success: true,
      count: enriched.length,
      communities: enriched,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single community details & members
// @route   GET /api/communities/:id
const getCommunityById = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id).populate(
      'creator',
      'name avatar currentCity'
    );

    if (!community) {
      return res.status(404).json({ success: false, message: 'Community not found' });
    }

    let isMember = false;
    let userRole = null;
    if (req.user) {
      const membership = await CommunityMember.findOne({
        community: community._id,
        user: req.user._id,
      });
      if (membership) {
        isMember = true;
        userRole = membership.role;
      }
    }

    const members = await CommunityMember.find({ community: community._id })
      .populate('user', 'name avatar currentCity college profession trustScore')
      .limit(30);

    res.status(200).json({
      success: true,
      community: {
        ...community.toObject(),
        isMember,
        userRole,
        members,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new community
// @route   POST /api/communities
const createCommunity = async (req, res) => {
  try {
    const { name, description, city, category, icon, coverImage } = req.body;

    if (!name || !description) {
      return res.status(400).json({
        success: false,
        message: 'Community name and description are required',
      });
    }

    const community = await Community.create({
      name: name.trim(),
      description: description.trim(),
      city: city ? city.trim() : req.user.currentCity || '',
      category: category || 'City Community',
      creator: req.user._id,
      icon: icon || '',
      coverImage: coverImage || '',
      memberCount: 1,
    });

    // Add creator as admin member
    await CommunityMember.create({
      community: community._id,
      user: req.user._id,
      role: 'admin',
    });

    res.status(201).json({
      success: true,
      message: 'Community created successfully',
      community,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Join community
// @route   POST /api/communities/:id/join
const joinCommunity = async (req, res) => {
  try {
    const communityId = req.params.id;
    const userId = req.user._id;

    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({ success: false, message: 'Community not found' });
    }

    const existingMember = await CommunityMember.findOne({
      community: communityId,
      user: userId,
    });

    if (existingMember) {
      return res.status(400).json({ success: false, message: 'You are already a member' });
    }

    await CommunityMember.create({
      community: communityId,
      user: userId,
      role: 'member',
    });

    community.memberCount = (community.memberCount || 0) + 1;
    await community.save();

    res.status(200).json({
      success: true,
      message: `You have joined ${community.name}`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Leave community
// @route   POST /api/communities/:id/leave
const leaveCommunity = async (req, res) => {
  try {
    const communityId = req.params.id;
    const userId = req.user._id;

    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({ success: false, message: 'Community not found' });
    }

    const deleted = await CommunityMember.findOneAndDelete({
      community: communityId,
      user: userId,
    });

    if (deleted) {
      community.memberCount = Math.max(0, (community.memberCount || 1) - 1);
      await community.save();
    }

    res.status(200).json({
      success: true,
      message: `You have left ${community.name}`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get community posts
// @route   GET /api/communities/:id/posts
const getCommunityPosts = async (req, res) => {
  try {
    const communityId = req.params.id;
    const posts = await CommunityPost.find({ community: communityId })
      .populate('author', 'name avatar currentCity college trustScore')
      .populate('comments.author', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(30);

    res.status(200).json({
      success: true,
      count: posts.length,
      posts,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create post in community
// @route   POST /api/communities/:id/posts
const createCommunityPost = async (req, res) => {
  try {
    const communityId = req.params.id;
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Post title and content are required',
      });
    }

    const post = await CommunityPost.create({
      community: communityId,
      author: req.user._id,
      title: title.trim(),
      content: content.trim(),
      likes: [],
      comments: [],
    });

    const populated = await CommunityPost.findById(post._id).populate(
      'author',
      'name avatar currentCity college trustScore'
    );

    res.status(201).json({
      success: true,
      message: 'Post published successfully',
      post: populated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add comment to community post
// @route   POST /api/communities/posts/:postId/comments
const addCommentToPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ success: false, message: 'Comment text is required' });
    }

    const post = await CommunityPost.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    post.comments.push({
      author: req.user._id,
      text: text.trim(),
      createdAt: new Date(),
    });

    await post.save();

    const refreshed = await CommunityPost.findById(postId)
      .populate('author', 'name avatar currentCity college trustScore')
      .populate('comments.author', 'name avatar');

    res.status(201).json({
      success: true,
      message: 'Comment added',
      post: refreshed,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getCommunities,
  getCommunityById,
  createCommunity,
  joinCommunity,
  leaveCommunity,
  getCommunityPosts,
  createCommunityPost,
  addCommentToPost,
};
