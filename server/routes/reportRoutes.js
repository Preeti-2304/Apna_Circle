const express = require('express');
const router = express.Router();
const { submitReport } = require('../controllers/adminController');
const { protect } = require('../middleware/auth');

router.post('/', protect, submitReport);

module.exports = router;
