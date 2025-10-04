const scheduleModel = require('../models/scheduleModel');
const reportModel = require('../models/reportsModel');
const userModel = require('../models/userModel');
const { getValuesFromToken } = require('../services/jwt');
const PDFDocument = require('pdfkit');

exports.getAllUsers = async (req, res) => { 
    try {
        const users = await userModel.find();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users', error });
    }
}

exports.getAllReports = async (req, res) => { 
    try {
        const reports = await reportModel.find();
        res.status(200).json(reports);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching reports', error });
    }
}

exports.viewReport = async (req, res) => {
    const {id} = req.params;
    try {
        const report = await reportModel.findById(id);
        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }
        res.status(200).json(report);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching report', error });
    }
}

exports.downloadReport = async (req, res) => { 
    try {
        // Fetch all reports from database
        const reports = await reportModel.find().sort({ date: -1 });
        
        if (!reports || reports.length === 0) {
            return res.status(404).json({ message: 'No reports found' });
        }

        // Create PDF document
        const doc = new PDFDocument();
        
        // Set response headers for PDF download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="waste-reports.pdf"');
        
        // Pipe PDF to response
        doc.pipe(res);
        
        // Add title
        doc.fontSize(20).text('WasteWise Reports', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'center' });
        doc.moveDown(2);
        
        // Add reports
        reports.forEach((report, index) => {
            // Add page break for each report (except first)
            if (index > 0) {
                doc.addPage();
            }
            
            // Report header
            doc.fontSize(16).text(`Report ${index + 1}`, { underline: true });
            doc.moveDown();
            
            // Report details
            doc.fontSize(12);
            doc.text(`Title: ${report.title}`, { continued: false });
            doc.text(`Description: ${report.description}`);
            doc.text(`Location: ${report.location || 'Not specified'}`);
            doc.text(`Date: ${new Date(report.date).toLocaleDateString()}`);
            
            if (report.image && report.image.length > 0) {
                doc.text(`Images: ${report.image.length} attached`);
                report.image.forEach((img, imgIndex) => {
                    doc.text(`  ${imgIndex + 1}. ${img}`);
                });
            }
            
            doc.moveDown(2);
            doc.text('---------------------------------------------------');
            doc.moveDown();
        });
        
        // Add summary at the end
        doc.addPage();
        doc.fontSize(16).text('Summary', { underline: true });
        doc.moveDown();
        doc.fontSize(12).text(`Total Reports: ${reports.length}`);
        doc.text(`Date Range: ${new Date(reports[reports.length - 1].date).toLocaleDateString()} - ${new Date(reports[0].date).toLocaleDateString()}`);
        
        // Finalize PDF
        doc.end();
        
    } catch (error) {
        console.error('Error generating report:', error);
        res.status(500).json({ message: 'Error generating report', error: error.message });
    }
}

exports.manageReport = async (req, res) => {
    const { id } = req.params;
    try {
        const report = await reportModel.findById(id);
        if (!report) {
            return res.status(404).json({ message: "Report not found" });
        }
        // Mark as resolved
        report.reportStatus = "resolved";
        await report.save();
        res.status(200).json({ message: "Report marked as resolved", report });
    } catch (error) {
        res.status(500).json({ message: "Failed to update report status", error: error.message });
    }
}

exports.suspendUser = async (req, res) => { 
    const {id} = req.params;
    try {
        const user = await userModel.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        user.status = 'suspended';
        await user.save();
        res.status(200).json({ message: 'User suspended successfully', user });
    } catch (error) {
        console.error('Error suspending user:', error);
        res.status(500).json({ message: 'Error suspending user', error: error.message });
    }
}

exports.banUser = async (req, res) => { 
    const {id} = req.params;
    try {
        const user = await userModel.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        user.status = 'banned';
        await user.save();
        res.status(200).json({ message: 'User banned successfully', user });
    } catch (error) {
        console.error('Error banning user:', error);
        res.status(500).json({ message: 'Error banning user', error: error.message });
    }
}

exports.deleteUser = async (req, res) => { 
    const {id} = req.params;
    try {
        const user = await userModel.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        await user.remove();
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Error deleting user', error: error.message });
    }
}

exports.activateUser = async (req, res) => { 
    const {id} = req.params;
    try {
        const user = await userModel.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        user.status = 'active';
        await user.save();
        res.status(200).json({ message: 'User activated successfully', user });
    } catch (error) {
        console.error('Error activating user:', error);
        res.status(500).json({ message: 'Error activating user', error: error.message });
    }
}

exports.getAllSchedules = async (req, res) => { 
    try {
        const schedules = await scheduleModel.find();
        res.status(200).json(schedules);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching schedules', error });
    }
}
