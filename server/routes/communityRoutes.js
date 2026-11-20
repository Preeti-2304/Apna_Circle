const express = require('express');
const router = express.Router();
const {
  getCommunities,
  getCommunityById,
  createCommunity,
  joinCommunity,
  leaveCommunity,
  getCommunityPosts,
  createCommunityPost,
  addCommentToPost,
} = require('../controllers/communityController');
const { protect, optionalAuth } = require('../middleware/auth');

router.get('/', optionalAuth, getCommunities);
router.post('/', protect, createCommunity);
router.get('/:id', optionalAuth, getCommunityById);
router.post('/:id/join', protect, joinCommunity);
router.post('/:id/leave', protect, leaveCommunity);
router.get('/:id/posts', optionalAuth, getCommunityPosts);
router.post('/:id/posts', protect, createCommunityPost);
router.post('/posts/:postId/comments', protect, addCommentToPost);

module.exports = router;
