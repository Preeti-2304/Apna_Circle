const express = require('express');
const router = express.Router();
const {
  updateProfile,
  getUserById,
  discoverUsers,
  getNearbyUsers,
  blockUser,
  unblockUser,
} = require('../controllers/userController');
const { protect, optionalAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/discover', optionalAuth, discoverUsers);
router.get('/nearby', optionalAuth, getNearbyUsers);
router.put('/profile', protect, updateProfile);
router.post('/upload-avatar', protect, upload.single('avatar'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  const fileUrl = `/uploads/${req.file.filename}`;
  res.status(200).json({ success: true, url: fileUrl });
});
router.get('/:id', optionalAuth, getUserById);
router.post('/:id/block', protect, blockUser);
router.post('/:id/unblock', protect, unblockUser);

module.exports = router;
