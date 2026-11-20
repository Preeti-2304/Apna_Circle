const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');

// @desc    Get all conversations for current user
// @route   GET /api/conversations
const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    const conversations = await Conversation.find({
      participants: userId,
    })
      .populate('participants', 'name avatar currentCity status trustScore availability')
      .populate('relatedHelpRequest', 'title category status')
      .sort({ lastMessageAt: -1 })
      .lean();

    // Attach unread count and other participant details
    const formatted = await Promise.all(
      conversations.map(async (c) => {
        const otherParticipant = c.participants.find(
          (p) => p._id.toString() !== userId.toString()
        );

        const unreadCount = await Message.countDocuments({
          conversation: c._id,
          sender: { $ne: userId },
          readBy: { $ne: userId },
        });

        return {
          ...c,
          otherParticipant,
          unreadCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      conversations: formatted,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get or create conversation with another user
// @route   POST /api/conversations
const getOrCreateConversation = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const { recipientId, helpRequestId } = req.body;

    if (!recipientId) {
      return res.status(400).json({
        success: false,
        message: 'Recipient ID is required',
      });
    }

    if (currentUserId.toString() === recipientId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot start conversation with yourself',
      });
    }

    // Check if conversation already exists between these two
    let conversation = await Conversation.findOne({
      participants: { $all: [currentUserId, recipientId], $size: 2 },
    })
      .populate('participants', 'name avatar currentCity status trustScore availability')
      .populate('relatedHelpRequest', 'title category status');

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [currentUserId, recipientId],
        relatedHelpRequest: helpRequestId || null,
        lastMessage: 'Conversation started',
        lastMessageAt: new Date(),
      });

      conversation = await Conversation.findById(conversation._id)
        .populate('participants', 'name avatar currentCity status trustScore availability')
        .populate('relatedHelpRequest', 'title category status');
    }

    const otherParticipant = conversation.participants.find(
      (p) => p._id.toString() !== currentUserId.toString()
    );

    res.status(200).json({
      success: true,
      conversation: {
        ...conversation.toObject(),
        otherParticipant,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get messages for a conversation
// @route   GET /api/messages/:conversationId
const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    // Check participant
    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !conversation.participants.includes(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view messages in this conversation',
      });
    }

    const messages = await Message.find({ conversation: conversationId })
      .populate('sender', 'name avatar')
      .sort({ createdAt: 1 })
      .limit(100);

    // Mark messages as read by current user
    await Message.updateMany(
      {
        conversation: conversationId,
        readBy: { $ne: userId },
      },
      {
        $addToSet: { readBy: userId },
      }
    );

    res.status(200).json({
      success: true,
      count: messages.length,
      messages,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Send a message via REST (fallback or direct)
// @route   POST /api/messages/:conversationId
const sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { text, attachmentUrl } = req.body;
    const userId = req.user._id;

    if (!text && !attachmentUrl) {
      return res.status(400).json({ success: false, message: 'Message text or attachment required' });
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !conversation.participants.includes(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to send messages in this conversation',
      });
    }

    const message = await Message.create({
      conversation: conversationId,
      sender: userId,
      text: text ? text.trim() : 'Image attachment',
      attachmentUrl: attachmentUrl || '',
      readBy: [userId],
    });

    conversation.lastMessage = text ? text.trim() : 'Image attachment';
    conversation.lastMessageAt = new Date();
    await conversation.save();

    const populatedMsg = await Message.findById(message._id).populate('sender', 'name avatar');

    // Broadcast via socket
    const io = req.app.get('io');
    if (io) {
      io.to(`conversation_${conversationId}`).emit('new_message', populatedMsg);
      // Notify other participant if they are online
      const recipientId = conversation.participants.find(
        (p) => p.toString() !== userId.toString()
      );
      if (recipientId) {
        io.to(`user_${recipientId}`).emit('message_notification', {
          conversationId,
          senderName: req.user.name,
          text: populatedMsg.text,
        });
      }
    }

    res.status(201).json({
      success: true,
      message: populatedMsg,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getConversations,
  getOrCreateConversation,
  getMessages,
  sendMessage,
};
