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

        // Parse locCoords from body (supports both 'locCoords' GeoJSON and legacy 'locCoord' {lat,lng})
        let locCoords;
        try {
            let raw = req.body.locCoords ?? req.body.locCoord ?? null;

            if (raw) {
                if (typeof raw === 'string') {
                    raw = JSON.parse(raw);
                }

                // Accept GeoJSON { type:'Point', coordinates:[lat, lng] }
                if (
                    raw?.type === 'Point' &&
                    Array.isArray(raw.coordinates) &&
                    raw.coordinates.length === 2
                ) {
                    const lat = Number(raw.coordinates[0]);
                    const lng = Number(raw.coordinates[1]);
                    if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
                        locCoords = { type: 'Point', coordinates: [lat, lng] };
                    }
                }
                // Accept legacy { lat, lng }
                else if (
                    typeof raw?.lat !== 'undefined' &&
                    typeof raw?.lng !== 'undefined'
                ) {
                    const lat = Number(raw.lat);
                    const lng = Number(raw.lng);
                    if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
                        locCoords = { type: 'Point', coordinates: [lat, lng] };
                    }
                }
            }
        } catch (_) {
            // Ignore parsing errors, locCoords will remain undefined
        }

        // Use upToCloudinary function to upload image
        const uploadResult = await new Promise((resolve, reject) => {
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
            reporterName: userData.username,
            location: location ?? null,
            date: new Date(),
            image: [uploadResult.imageUrl],
            ...(locCoords ? { locCoords } : {}) // only set if provided/valid
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