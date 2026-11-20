const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      select: false, // Don't return password by default
    },
    avatar: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      maxlength: 500,
      default: '',
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Non-binary', 'Prefer not to say', ''],
      default: '',
    },
    dob: {
      type: Date,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    otpCode: {
      type: String,
      select: false,
    },
    otpExpiresAt: {
      type: Date,
      select: false,
    },
    resetPasswordToken: {
      type: String,
      select: false,
    },
    resetPasswordExpiresAt: {
      type: Date,
      select: false,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    status: {
      type: String,
      enum: ['active', 'suspended'],
      default: 'active',
    },
    // Location
    originallyFrom: {
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      country: { type: String, default: 'India' },
    },
    currentlyLivingIn: {
      city: { type: String, default: 'Delhi' },
      state: { type: String, default: 'Delhi' },
      country: { type: String, default: 'India' },
    },
    currentCity: {
      type: String,
      default: 'Delhi',
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
        default: [77.209, 28.6139], // Default Delhi coordinates
      },
    },
    hideLiveLocation: {
      type: Boolean,
      default: false,
    },
    // Education & Work
    college: {
      type: String,
      default: '',
    },
    course: {
      type: String,
      default: '',
    },
    profession: {
      type: String,
      default: '',
    },
    company: {
      type: String,
      default: '',
    },
    // Languages & Skills
    languages: {
      type: [String],
      default: ['Hindi', 'English'],
    },
    skills: {
      type: [String],
      default: [],
    },
    canHelpCategories: {
      type: [String],
      default: [],
    },
    availability: {
      type: String,
      enum: ['Available', 'Busy', 'Unavailable'],
      default: 'Available',
    },
    profileVisibility: {
      type: String,
      enum: ['public', 'friends_only', 'private'],
      default: 'public',
    },
    preferredContact: {
      type: String,
      enum: ['chat', 'email', 'phone'],
      default: 'chat',
    },
    profileCompletion: {
      type: Number,
      default: 70,
      min: 0,
      max: 100,
    },
    // Reputation & Gamification
    trustScore: {
      type: Number,
      default: 80,
      min: 0,
      max: 100,
    },
    rewardPoints: {
      type: Number,
      default: 50,
    },
    level: {
      type: Number,
      default: 1,
      min: 1,
      max: 5,
    },
    helpCompletedCount: {
      type: Number,
      default: 0,
    },
    reviewsCount: {
      type: Number,
      default: 0,
    },
    averageRating: {
      type: Number,
      default: 5.0,
      min: 0,
      max: 5,
    },
    badges: {
      type: [String],
      default: ['New Member'],
    },
    blockedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// 2dsphere index for location queries
userSchema.index({ location: '2dsphere' });
userSchema.index({ 'originallyFrom.city': 1 });
userSchema.index({ college: 1 });
userSchema.index({ skills: 1 });
userSchema.index({ canHelpCategories: 1 });

// Helper method to calculate profile completion
userSchema.methods.calculateProfileCompletion = function () {
  let score = 30; // base score for registered account
  if (this.avatar) score += 10;
  if (this.bio) score += 10;
  if (this.originallyFrom?.city) score += 10;
  if (this.college || this.profession) score += 10;
  if (this.skills && this.skills.length > 0) score += 15;
  if (this.canHelpCategories && this.canHelpCategories.length > 0) score += 15;
  this.profileCompletion = Math.min(100, score);
  return this.profileCompletion;
};

// Helper method to update level based on points
userSchema.methods.updateLevel = function () {
  if (this.rewardPoints >= 1000) this.level = 5; // Community Champion
  else if (this.rewardPoints >= 500) this.level = 4; // Trusted Helper
  else if (this.rewardPoints >= 250) this.level = 3; // Community Helper
  else if (this.rewardPoints >= 100) this.level = 2; // Active Member
  else this.level = 1; // New Member
  return this.level;
};

module.exports = mongoose.model('User', userSchema);
