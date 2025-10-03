const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {type: String, required: true, unique: true},
    role: {type: String, default: 'user', enum: ['user', 'admin']},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    phoneNum: {type: String, require: true},
    status: {type: String, default: 'active', enum: ['active', 'suspended', 'banned']},
}, { collection: 'users' });

const User = new mongoose.model('users', userSchema);

module.exports = User

