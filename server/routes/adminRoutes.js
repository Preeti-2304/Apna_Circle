const express = require('express');
const router = express.Router();
const {
  getAdminDashboard,
  getAdminUsers,
  updateUserStatus,
  getReports,
  resolveReport,
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect);
router.use(adminOnly);

router.get('/dashboard', getAdminDashboard);
router.get('/users', getAdminUsers);
router.put('/users/:id/status', updateUserStatus);
router.get('/reports', getReports);
router.put('/reports/:id/resolve', resolveReport);

module.exports = router;
