const mongoose = require('mongoose');

const friendshipSchema = new mongoose.Schema(
  {
    user1: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    user2: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        index: true,
      },
    ],
    status: {
      type: String,
      enum: ['accepted'],
      default: 'accepted',
    },
  },
  {
    timestamps: true,
  }
);

// Ensure uniqueness regardless of order: we store user1 < user2 or enforce compound unique
friendshipSchema.index({ user1: 1, user2: 1 }, { unique: true });

module.exports = mongoose.model('Friendship', friendshipSchema);
