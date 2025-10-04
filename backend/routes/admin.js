const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken } = require('../services/jwt');

// User management routes
router.get('/users', authenticateToken('admin'), adminController.getAllUsers);
router.patch('/users/:id/suspend', authenticateToken('admin'), adminController.suspendUser);
router.patch('/users/:id/ban', authenticateToken('admin'), adminController.banUser);
router.patch('/users/:id/activate', authenticateToken('admin'), adminController.activateUser);

// Reports management routes
router.get('/reports', authenticateToken('admin'), adminController.getAllReports);
router.patch('/reports/:id/manage', authenticateToken('admin'), adminController.manageReport);

// Schedule management routes
router.get('/schedules', authenticateToken('admin'), adminController.getAllSchedules);

module.exports = router;