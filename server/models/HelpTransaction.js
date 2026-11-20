const mongoose = require('mongoose');

const helpTransactionSchema = new mongoose.Schema(
  {
    helpRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'HelpRequest',
      required: true,
      index: true,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    helper: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    category: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['in_progress', 'completed', 'cancelled'],
      default: 'in_progress',
    },
    pointsAwarded: {
      type: Number,
      default: 0,
    },
    isConfirmedByCreator: {
      type: Boolean,
      default: false,
    },
    confirmedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

helpTransactionSchema.index({ helpRequest: 1, helper: 1 });

module.exports = mongoose.model('HelpTransaction', helpTransactionSchema);
