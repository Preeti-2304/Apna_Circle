const { verifyToken } = require('../utils/jwt');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const User = require('../models/User');

const onlineUsers = new Map(); // userId -> Set(socketId)

const initializeSocket = (io) => {
  // Authentication middleware for Socket.IO
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) {
      return next(new Error('Authentication error: Token required'));
    }
    try {
      const decoded = verifyToken(token);
      socket.userId = decoded.id;
      next();
    } catch (err) {
      return next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.userId;
    console.log(`[Socket] User connected: ${userId} (${socket.id})`);

    // Add user to online registry
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId).add(socket.id);

    // Join personal room for notifications
    socket.join(`user_${userId}`);

    // Broadcast online status
    io.emit('user_status', { userId, status: 'online' });

    // Join conversation room
    socket.on('join_conversation', (conversationId) => {
      socket.join(`conversation_${conversationId}`);
      console.log(`[Socket] User ${userId} joined room conversation_${conversationId}`);
    });

    // Leave conversation room
    socket.on('leave_conversation', (conversationId) => {
      socket.leave(`conversation_${conversationId}`);
    });

    // Send message via socket
    socket.on('send_message', async (data) => {
      try {
        const { conversationId, text, attachmentUrl } = data;
        if (!conversationId || (!text && !attachmentUrl)) return;

        const conversation = await Conversation.findById(conversationId);
        if (!conversation || !conversation.participants.includes(userId)) return;

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

        const populated = await Message.findById(message._id).populate('sender', 'name avatar');

        // Broadcast to conversation room
        io.to(`conversation_${conversationId}`).emit('new_message', populated);

        // Notify other participants in personal rooms
        conversation.participants.forEach((pId) => {
          if (pId.toString() !== userId.toString()) {
            io.to(`user_${pId}`).emit('message_notification', {
              conversationId,
              message: populated,
            });
          }
        });
      } catch (err) {
        console.error('[Socket Send Message Error]:', err);
      }
    });

    // Typing indicators
    socket.on('typing_start', ({ conversationId, userName }) => {
      socket.to(`conversation_${conversationId}`).emit('typing_start', {
        conversationId,
        userId,
        userName,
      });
    });

    socket.on('typing_stop', ({ conversationId }) => {
      socket.to(`conversation_${conversationId}`).emit('typing_stop', {
        conversationId,
        userId,
      });
    });

    // Check online status of user list
    socket.on('check_online', (userIds, callback) => {
      if (typeof callback === 'function' && Array.isArray(userIds)) {
        const statuses = {};
        userIds.forEach((id) => {
          statuses[id] = onlineUsers.has(id) && onlineUsers.get(id).size > 0;
        });
        callback(statuses);
      }
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`[Socket] User disconnected: ${userId} (${socket.id})`);
      if (onlineUsers.has(userId)) {
        onlineUsers.get(userId).delete(socket.id);
        if (onlineUsers.get(userId).size === 0) {
          onlineUsers.delete(userId);
          io.emit('user_status', { userId, status: 'offline' });
        }
      }
    });
  });
};

module.exports = { initializeSocket, onlineUsers };
