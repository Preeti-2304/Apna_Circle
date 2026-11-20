const express = require('express');
const router = express.Router();
const {
  register,
  login,
  verifyOTP,
  resendOTP,
  forgotPassword,
  resetPassword,
  getMe,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', protect, getMe);
router.post('/logout', (req, res) => res.status(200).json({ success: true, message: 'Logged out successfully' }));

module.exports = router;
