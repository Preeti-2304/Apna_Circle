const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    reportedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    targetType: {
      type: String,
      enum: ['user', 'request', 'post', 'review'],
      required: true,
    },
    targetId: {
      type: String,
      required: true,
    },
    reason: {
      type: String,
      required: true,
      enum: ['Spam', 'Harassment', 'Inappropriate Content', 'Fake Account', 'Scam / Fraud', 'Other'],
    },
    details: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'resolved', 'dismissed'],
      default: 'pending',
      index: true,
    },
    resolutionNotes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Report', reportSchema);
