const express = require('express');
const router = express.Router();
const {
  getConversations,
  getOrCreateConversation,
  getMessages,
  sendMessage,
} = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/conversations', getConversations);
router.post('/conversations', getOrCreateConversation);
router.get('/messages/:conversationId', getMessages);
router.post('/messages/:conversationId', sendMessage);

module.exports = router;
