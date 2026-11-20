const Review = require('../models/Review');
const HelpRequest = require('../models/HelpRequest');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { awardPoints, POINT_RULES } = require('../services/rewardService');

// @desc    Submit a review after completed assistance
// @route   POST /api/reviews
const createReview = async (req, res) => {
  try {
    const { helpRequestId, rating, feedback } = req.body;
    const authorId = req.user._id;

    if (!helpRequestId || !rating || !feedback) {
      return res.status(400).json({
        success: false,
        message: 'Help request ID, rating (1-5), and feedback are required',
      });
    }

    const numRating = Number(rating);
    if (numRating < 1 || numRating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5 stars',
      });
    }

    const request = await HelpRequest.findById(helpRequestId);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Help request not found' });
    }

    // Security check: Must be a participant (either creator reviewing helper, or helper reviewing creator)
    const isCreator = request.creator.toString() === authorId.toString();
    const isHelper =
      request.acceptedHelper &&
      request.acceptedHelper.toString() === authorId.toString();

    if (!isCreator && !isHelper) {
      return res.status(403).json({
        success: false,
        message: 'You can only review requests you were directly involved in',
      });
    }

    // Must be completed
    if (request.status !== 'Completed') {
      return res.status(400).json({
        success: false,
        message: 'You can only submit a review after the request is completed',
      });
    }

    // Target user is the other party
    const targetUserId = isCreator ? request.acceptedHelper : request.creator;

    // Check if duplicate review already exists
    const existing = await Review.findOne({
      author: authorId,
      helpRequest: helpRequestId,
    });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a review for this transaction',
      });
    }

    const review = await Review.create({
      author: authorId,
      targetUser: targetUserId,
      helpRequest: helpRequestId,
      rating: numRating,
      feedback: feedback.trim(),
      category: request.category,
    });

    // Update target user's reputation stats & trust score
    const targetUser = await User.findById(targetUserId);
    if (targetUser) {
      const allUserReviews = await Review.find({ targetUser: targetUserId });
      const totalRatings = allUserReviews.reduce((sum, r) => sum + r.rating, 0);
      const avg = Math.round((totalRatings / allUserReviews.length) * 10) / 10;

      targetUser.reviewsCount = allUserReviews.length;
      targetUser.averageRating = avg;

      // Trust score formula based on verified reviews and completed assistance
      // Base 75 + (avg - 3)*5 + (completedCount * 2) capped at 100
      const calculatedTrust = Math.min(
        100,
        Math.max(
          50,
          Math.round(75 + (avg - 3) * 5 + (targetUser.helpCompletedCount || 0) * 2)
        )
      );
      targetUser.trustScore = calculatedTrust;
      await targetUser.save();

      // If rating >= 4, award positive feedback bonus points to helper
      if (numRating >= 4) {
        const io = req.app.get('io');
        await awardPoints({
          userId: targetUserId,
          amount: POINT_RULES.POSITIVE_FEEDBACK,
          action: `Received 5-Star Feedback for ${request.category}`,
          referenceId: review._id.toString(),
          category: request.category,
          io,
        });
      }

      // Notify target user
      const notif = await Notification.create({
        recipient: targetUserId,
        sender: authorId,
        type: 'review_received',
        title: 'New Review Received!',
        message: `${req.user.name} gave you a ${numRating}-star review: "${feedback.slice(0, 50)}..."`,
        link: `/profile/${targetUserId}`,
      });

      const io = req.app.get('io');
      if (io) {
        io.to(`user_${targetUserId}`).emit('notification', notif);
      }
    }

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      review,
    });
  } catch (error) {
    console.error('[Create Review Error]:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get reviews for a user
// @route   GET /api/users/:id/reviews
const getUserReviews = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const reviews = await Review.find({ targetUser: targetUserId })
      .populate('author', 'name avatar currentCity college')
      .populate('helpRequest', 'title category')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createReview,
  getUserReviews,
};
