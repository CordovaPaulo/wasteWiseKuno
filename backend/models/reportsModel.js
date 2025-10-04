const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    title: { type: String, required: true },
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
    image: { type: [String], default: [] },
    description: { type: String, required: true },
    location: { type: String, required: false, default: null },
    date: { type: Date, required: true },
    reportStatus: { type: String, enum: ['pending', 'resolved'], default: 'pending' },
    createdAt: { type: Date, default: Date.now }
}, { collection: 'reports' });

const Report = mongoose.model('Reports', reportSchema);

module.exports = Report;