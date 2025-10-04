const express = require('express');
const router = express.Router();
const userController = require('../controllers/userControllers');
const multer = require('multer');
const upload = multer(); 
const { authenticateToken } = require('../services/jwt');

router.get('/schedules', authenticateToken('user'), userController.getAllSchedules);
router.get('/reports', authenticateToken('user'), userController.getAllReports);

// Add this endpoint for report creation
router.post('/report', authenticateToken('user'), upload.single('image'), userController.setReport);

module.exports = router;