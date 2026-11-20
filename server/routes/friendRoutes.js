const express = require('express');
const router = express.Router();
const {
  sendFriendRequest,
  getFriendRequests,
  acceptFriendRequest,
  rejectFriendRequest,
  cancelFriendRequest,
  removeFriend,
  getFriends,
  getFriendsOfFriends,
} = require('../controllers/friendController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/request/:userId', sendFriendRequest);
router.get('/requests', getFriendRequests);
router.post('/accept/:requestId', acceptFriendRequest);
router.post('/reject/:requestId', rejectFriendRequest);
router.post('/cancel/:requestId', cancelFriendRequest);
router.delete('/:userId', removeFriend);
router.get('/', getFriends);
router.get('/of-friends', getFriendsOfFriends);

module.exports = router;
