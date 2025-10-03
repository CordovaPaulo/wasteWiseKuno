const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// User management routes
router.get('/users', adminController.getAllUsers);
router.patch('/users/:id/suspend', adminController.suspendUser);
router.patch('/users/:id/ban', adminController.banUser);
router.delete('/users/:id', adminController.deleteUser);
router.patch('/users/:id/activate', adminController.activateUser);

// Report management routes
router.get('/reports', adminController.getAllReports);
router.get('/reports/:id', adminController.viewReport);
router.get('/reports/download/pdf', adminController.downloadReport);
router.patch('/reports/:id/manage', adminController.manageReport);

module.exports = router;