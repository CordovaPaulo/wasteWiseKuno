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

router.patch('/report/:id', authenticateToken('user'), upload.single('image'), userController.editReport);

router.post('/wastelog', authenticateToken('user'), userController.addWasteLog);
router.get('/wastelogs', authenticateToken('user'), userController.getWasteLogs);
router.delete('/wastelog/:id', authenticateToken('user'), userController.deleteWasteLog);

module.exports = router;