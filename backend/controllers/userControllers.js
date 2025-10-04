const scheduleModel = require('../models/scheduleModel');
const reportModel = require('../models/reportsModel');
const { getValuesFromToken } = require('../services/jwt');
const cloudinaryController = require('./cloudinarycontroller');

exports.getAllSchedules = async (req, res) => { 
    try {
        const schedules = await scheduleModel.find();
        res.status(200).json(schedules);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching schedules', error });
    }
}

exports.setReport = async (req, res) => { 
    const userData = getValuesFromToken(req);

    if (!userData) {
        return res.status(401).json({ error: 'Invalid or expired token or null', token: userData });
    }

    const { title, description, location } = req.body;
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image file provided.' });
        }

        // Use upToCloudinary function to upload image
        const uploadResult = await new Promise((resolve, reject) => {
            // Mock res object to capture result from upToCloudinary
            const mockRes = {
                status: (code) => ({
                    json: (data) => {
                        if (code === 200) resolve(data);
                        else reject(data);
                    }
                })
            };
            cloudinaryController.upToCloudinary(req, mockRes);
        });

        // Save report to DB
        const report = new reportModel({
            title,
            description,
            reporter: userData.id,
            location,
            date: new Date(),
            image: [uploadResult.imageUrl]
        });
        await report.save();

        res.status(201).json({ message: 'Report created successfully!', report });
    } catch (error) {
        res.status(500).json({ message: 'Error creating report', error });
    }
}

exports.getAllReports = async (req, res) => { 
    const userData = getValuesFromToken(req);

    if (!userData) {
        return res.status(401).json({ error: 'Invalid or expired token', token: userData });
    }

    try {
        const reports = await reportModel.find({ reporter: userData.id });
        res.status(200).json(reports);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching reports', error });
    }
}