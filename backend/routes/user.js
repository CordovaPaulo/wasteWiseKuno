const express = require('express');
const router = express.Router();
const userController = require('../controllers/userControllers');
const multer = require('multer');
const upload = multer(); // For handling multipart/form-data

router.get('/schedules', userController.getAllSchedules);

// Add this endpoint for report creation
router.post('/report', upload.single('image'), userController.setReport);

module.exports = router;