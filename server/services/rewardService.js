const User = require('../models/User');
const RewardTransaction = require('../models/RewardTransaction');
const Notification = require('../models/Notification');

// Point rule values defined strictly on backend
const POINT_RULES = {
  COMPLETED_HELP_DEFAULT: 50,
  TRAVEL_GUIDANCE: 20,
  TECHNICAL_ASSISTANCE: 30,
  EMERGENCY_ASSISTANCE: 75,
  VEHICLE_HELP: 40,
  EDUCATION_HELP: 35,
  LOCAL_GUIDANCE: 30,
  POSITIVE_FEEDBACK: 10,
  REFERRAL: 20,
  SIGNUP_BONUS: 50,
};

const getCategoryPoints = (category) => {
  switch (category) {
    case 'Travel Help':
      return POINT_RULES.TRAVEL_GUIDANCE;
    case 'Technology Help':
      return POINT_RULES.TECHNICAL_ASSISTANCE;
    case 'Emergency Assistance':
      return POINT_RULES.EMERGENCY_ASSISTANCE;
    case 'Vehicle Help':
      return POINT_RULES.VEHICLE_HELP;
    case 'Education Help':
      return POINT_RULES.EDUCATION_HELP;
    case 'Local Guidance':
      return POINT_RULES.LOCAL_GUIDANCE;
    default:
      return POINT_RULES.COMPLETED_HELP_DEFAULT;
  }
};

/**
 * Award reward points to a user with audit trail, level progression, and badge updates
 */
const awardPoints = async ({
  userId,
  amount,
  action,
  referenceId = '',
  category = '',
  io = null,
}) => {
  // Prevent duplicate reward if referenceId is already rewarded
  if (referenceId) {
    const existing = await RewardTransaction.findOne({
      user: userId,
      referenceId,
      action,
    });
    if (existing) {
      console.warn(`[Rewards] Duplicate reward prevention triggered for user ${userId}, ref ${referenceId}`);
      return { awarded: false, reason: 'Duplicate reward prevented' };
    }
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found for point award');
  }

  const newBalance = (user.rewardPoints || 0) + amount;
  user.rewardPoints = newBalance;

  // Check badges & achievements
  const newBadges = [...(user.badges || [])];
  if (user.helpCompletedCount >= 1 && !newBadges.includes('First Help')) {
    newBadges.push('First Help');
  }
  if (user.helpCompletedCount >= 10 && !newBadges.includes('10 People Helped')) {
    newBadges.push('10 People Helped');
  }
  if (category === 'Travel Help' && !newBadges.includes('Travel Expert')) {
    newBadges.push('Travel Expert');
  }
  if (category === 'Local Guidance' && !newBadges.includes('Local Hero')) {
    newBadges.push('Local Hero');
  }
  if (newBalance >= 1000 && !newBadges.includes('Community Champion')) {
    newBadges.push('Community Champion');
  }
  user.badges = newBadges;

  // Update level
  user.updateLevel();
  await user.save();

  // Create immutable transaction ledger record
  const transaction = await RewardTransaction.create({
    user: userId,
    type: amount >= 0 ? 'EARNED' : 'REDEEMED',
    amount,
    action,
    referenceId: referenceId ? referenceId.toString() : '',
    category,
    balanceAfter: newBalance,
  });

  // Notify user
  const notif = await Notification.create({
    recipient: userId,
    type: 'reward_earned',
    title: 'Reward Points Earned!',
    message: `You earned +${amount} points for: ${action}! Current balance: ${newBalance} pts.`,
    link: '/rewards',
  });

  if (io) {
    io.to(`user_${userId}`).emit('notification', notif);
  }

  return {
    awarded: true,
    amount,
    balanceAfter: newBalance,
    level: user.level,
    transaction,
  };
};

module.exports = {
  POINT_RULES,
  getCategoryPoints,
  awardPoints,
};
