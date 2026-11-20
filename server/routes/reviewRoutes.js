const express = require('express');
const router = express.Router();
const {
  createReview,
  getUserReviews,
} = require('../controllers/reviewController');
const { protect, optionalAuth } = require('../middleware/auth');

router.post('/', protect, createReview);
router.get('/user/:id', optionalAuth, getUserReviews);

module.exports = router;
