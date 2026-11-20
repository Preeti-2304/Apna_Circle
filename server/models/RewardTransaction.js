const mongoose = require('mongoose');

const rewardTransactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['EARNED', 'REDEEMED', 'BONUS'],
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    action: {
      type: String,
      required: true,
    },
    referenceId: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      default: '',
    },
    balanceAfter: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

rewardTransactionSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('RewardTransaction', rewardTransactionSchema);
