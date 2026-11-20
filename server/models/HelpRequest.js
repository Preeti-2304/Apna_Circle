const mongoose = require('mongoose');

const helpRequestSchema = new mongoose.Schema(
  {
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Request title is required'],
      trim: true,
      maxlength: 120,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: 2000,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Travel Help',
        'Vehicle Help',
        'Local Guidance',
        'Technology Help',
        'Education Help',
        'Accommodation Guidance',
        'Emergency Assistance',
        'Other',
      ],
      index: true,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
      index: true,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [77.209, 28.6139],
      },
    },
    urgency: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Emergency'],
      default: 'Medium',
      index: true,
    },
    preferredLanguage: {
      type: String,
      default: 'Hindi',
    },
    requiredSkills: {
      type: [String],
      default: [],
    },
    visibility: {
      type: String,
      enum: ['public', 'friends_only'],
      default: 'public',
    },
    status: {
      type: String,
      enum: ['Open', 'Matched', 'Accepted', 'In Progress', 'Completed', 'Cancelled'],
      default: 'Open',
      index: true,
    },
    acceptedHelper: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    responses: [
      {
        helper: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        message: {
          type: String,
          default: '',
        },
        proposedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

helpRequestSchema.index({ location: '2dsphere' });
helpRequestSchema.index({ city: 1, category: 1, status: 1 });

module.exports = mongoose.model('HelpRequest', helpRequestSchema);
