const mongoose = require('mongoose');

const communitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    city: {
      type: String,
      default: '',
      index: true,
    },
    category: {
      type: String,
      enum: ['City Community', 'Students', 'Tech', 'Travel', 'Vehicle & Transit', 'General'],
      default: 'City Community',
      index: true,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    icon: {
      type: String,
      default: '',
    },
    coverImage: {
      type: String,
      default: '',
    },
    memberCount: {
      type: Number,
      default: 1,
    },
    isOfficial: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

communitySchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Community', communitySchema);
