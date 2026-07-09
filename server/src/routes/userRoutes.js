const express = require('express');
const router = express.Router();
const {
    getAllUsers,
    createUser,
    updateUserRole,
    deactivateUser
} = require('../controllers/userController');
const { authenticate, authorise } = require('../middleware/auth');

// all routes require authentication and admin role
router.get('/', authenticate, authorise('admin'), getAllUsers);
router.post('/', authenticate, authorise('admin'), createUser);
router.patch('/:id/role', authenticate, authorise('admin'), updateUserRole);
router.patch('/:id/deactivate', authenticate, authorise('admin'), deactivateUser);

module.exports = router;