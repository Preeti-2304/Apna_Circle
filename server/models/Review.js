const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    targetUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    helpRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'HelpRequest',
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    feedback: {
      type: String,
      required: [true, 'Feedback text is required'],
      trim: true,
      maxlength: 1000,
    },
    category: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent multiple reviews on the same help request by the same author
reviewSchema.index({ author: 1, helpRequest: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
