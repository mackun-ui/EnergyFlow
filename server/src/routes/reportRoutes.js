const express = require('express');
const router = express.Router();
const {
  getDailyReport,
  getAllocationSummary,
  getAuditLogs
} = require('../controllers/reportController');
const { authenticate, authorise } = require('../middleware/auth');

router.get('/daily', authenticate, getDailyReport);
router.get('/allocation', authenticate, getAllocationSummary);
router.get(
  '/audit-logs',
  authenticate,
  authorise('admin'),
  getAuditLogs
);

module.exports = router;