const express = require('express');
const router = express.Router();
const {
  createHelpRequest,
  getHelpRequests,
  getHelpRequestById,
  updateHelpRequest,
  deleteHelpRequest,
  respondToHelpRequest,
  acceptHelper,
  completeHelpRequest,
  getMatchesForRequest,
} = require('../controllers/helpController');
const { protect, optionalAuth } = require('../middleware/auth');

router.get('/', optionalAuth, getHelpRequests);
router.post('/', protect, createHelpRequest);
router.get('/:id', optionalAuth, getHelpRequestById);
router.put('/:id', protect, updateHelpRequest);
router.delete('/:id', protect, deleteHelpRequest);
router.post('/:id/respond', protect, respondToHelpRequest);
router.post('/:id/accept', protect, acceptHelper);
router.post('/:id/complete', protect, completeHelpRequest);
router.get('/:id/matches', optionalAuth, getMatchesForRequest);

module.exports = router;
