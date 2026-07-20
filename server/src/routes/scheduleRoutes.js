const express = require('express');
const router = express.Router();
const {
  getFacilities,
  updateFacilityPriority,
  getSchedules,
  createSchedule,
  updateSchedule,
  applyLowEnergyProtocol
} = require('../controllers/scheduleController');
const { authenticate, authorise } = require('../middleware/auth');

// facility routes
router.get('/facilities', authenticate, getFacilities);
router.patch(
  '/facilities/:facilityId/priority',
  authenticate,
  authorise('admin'),
  updateFacilityPriority
);

// schedule routes
router.get('/', authenticate, getSchedules);
router.post(
  '/',
  authenticate,
  authorise('admin', 'energy_provider'),
  createSchedule
);
router.patch(
  '/:scheduleId',
  authenticate,
  authorise('admin', 'energy_provider'),
  updateSchedule
);

// low energy protocol
router.post(
  '/low-energy-protocol',
  authenticate,
  authorise('admin', 'energy_provider'),
  applyLowEnergyProtocol
);

module.exports = router;