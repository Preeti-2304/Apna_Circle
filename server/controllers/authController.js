const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { generateToken } = require('../utils/jwt');
const { generateOTP, sendOTPEmail } = require('../utils/otp');
const { awardPoints, POINT_RULES } = require('../services/rewardService');

// @desc    Register a new user
// @route   POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, phone, password, confirmPassword } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required',
      });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    const emailNormalized = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: emailNormalized });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists',
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate 6-digit OTP
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const user = await User.create({
      name: name.trim(),
      email: emailNormalized,
      phone: phone ? phone.trim() : '',
      password: hashedPassword,
      otpCode: otp,
      otpExpiresAt: otpExpires,
      isVerified: false,
      rewardPoints: 50,
      profileCompletion: 40,
    });

    // Send OTP
    await sendOTPEmail(emailNormalized, otp, 'verification');

    const token = generateToken(user._id, user.role);

    // Return sanitized user object
    const userObj = user.toObject();
    delete userObj.password;
    delete userObj.otpCode;
    delete userObj.otpExpiresAt;

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please verify the OTP sent to your email.',
      token,
      user: userObj,
      // For development ease, include devOtp if running locally
      devOtp: process.env.NODE_ENV !== 'production' ? otp : undefined,
    });
  } catch (error) {
    console.error('[Auth Register Error]:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during registration',
    });
  }
};

// @desc    Log in user
// @route   POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    const emailNormalized = email.toLowerCase().trim();
    const user = await User.findOne({ email: emailNormalized }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({
        success: false,
        message: 'Account is suspended. Please contact administrator.',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const token = generateToken(user._id, user.role);

    const userObj = user.toObject();
    delete userObj.password;

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: userObj,
    });
  } catch (error) {
    console.error('[Auth Login Error]:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
    });
  }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required',
      });
    }

    const emailNormalized = email.toLowerCase().trim();
    const user = await User.findOne({ email: emailNormalized }).select(
      '+otpCode +otpExpiresAt'
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (user.isVerified) {
      return res.status(200).json({
        success: true,
        message: 'Account is already verified',
        user,
      });
    }

    if (user.otpCode !== otp.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP code',
      });
    }

    if (user.otpExpiresAt && user.otpExpiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'OTP code has expired. Please request a new one.',
      });
    }

    user.isVerified = true;
    user.otpCode = undefined;
    user.otpExpiresAt = undefined;
    await user.save();

    // Award initial signup & verification bonus
    await awardPoints({
      userId: user._id,
      amount: POINT_RULES.SIGNUP_BONUS,
      action: 'Verified Account Bonus',
      referenceId: user._id.toString(),
    });

    const refreshedUser = await User.findById(user._id);
    const token = generateToken(refreshedUser._id, refreshedUser.role);

    res.status(200).json({
      success: true,
      message: 'Account verified successfully! Welcome to ApnaCircle.',
      token,
      user: refreshedUser,
    });
  } catch (error) {
    console.error('[Auth Verify OTP Error]:', error);
    res.status(500).json({
      success: false,
      message: 'Server error verifying OTP',
    });
  }
};

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const emailNormalized = email.toLowerCase().trim();
    const user = await User.findOne({ email: emailNormalized });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const otp = generateOTP();
    user.otpCode = otp;
    user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendOTPEmail(emailNormalized, otp, 'verification');

    res.status(200).json({
      success: true,
      message: 'New OTP code sent to your email',
      devOtp: process.env.NODE_ENV !== 'production' ? otp : undefined,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Forgot Password
// @route   POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const emailNormalized = email.toLowerCase().trim();
    const user = await User.findOne({ email: emailNormalized });
    if (!user) {
      // Don't disclose whether email exists
      return res.status(200).json({
        success: true,
        message: 'If an account exists with this email, a reset code has been sent.',
      });
    }

    const resetOtp = generateOTP();
    user.resetPasswordToken = resetOtp;
    user.resetPasswordExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
    await user.save();

    await sendOTPEmail(emailNormalized, resetOtp, 'reset');

    res.status(200).json({
      success: true,
      message: 'If an account exists with this email, a reset code has been sent.',
      devOtp: process.env.NODE_ENV !== 'production' ? resetOtp : undefined,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Email, reset code, and new password are required',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      });
    }

    const emailNormalized = email.toLowerCase().trim();
    const user = await User.findOne({ email: emailNormalized }).select(
      '+resetPasswordToken +resetPasswordExpiresAt'
    );

    if (!user || user.resetPasswordToken !== otp.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired password reset code',
      });
    }

    if (user.resetPasswordExpiresAt && user.resetPasswordExpiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Reset code has expired. Please request a new one.',
      });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password has been reset successfully. You can now log in.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  register,
  login,
  verifyOTP,
  resendOTP,
  forgotPassword,
  resetPassword,
  getMe,
};
