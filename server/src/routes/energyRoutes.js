const express = require('express');
const router = express.Router();
const {
  getLatestMetrics,
  getHistoricalMetrics,
  getCommunitySummary,
  getOutageStatus
} = require('../controllers/energyController');
const { authenticate } = require('../middleware/auth');

router.get('/latest', authenticate, getLatestMetrics);
router.get('/summary', authenticate, getCommunitySummary);
router.get('/outages', authenticate, getOutageStatus);
router.get('/history/:facilityId', authenticate, getHistoricalMetrics);

module.exports = router;