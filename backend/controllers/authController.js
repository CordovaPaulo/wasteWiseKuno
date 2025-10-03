const userModel = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.signup = async (req, res) => {
    const { username, password, confirmPass, phoneNum, email } = req.body;

    if (!username || !password || !confirmPass || !phoneNum || !email) {
        return res.status(400).json({ message: 'All fields are required', code: 400 });
    }
    if (phoneNum.length != 11){
        return res.status(400).json({ message: 'Phone number must be 11 digits long', code: 400 });
    }
    if (password !== confirmPass){
        return res.status(400).json({ message: "Password doesn't match", code:400 });
    }
    try {
        const hashedPass = await bcrypt.hash(password, 15);

        const user = new userModel({
            username,
            email,
            password: hashedPass,
            phoneNum,
        });

        await user.save();
        return res.status(200).json(user);
    } catch (error) {
        return res.status(500).json({error})
    }
   
};

exports.login = async (req, res) => {
    const { cred, password } = req.body;

    if (!cred || !password){
        return res.status(400).json({ message: 'All field are required', code: 400 });
    }

    try {
        const query = [
            { username: cred },
            { email: cred }
        ];

        const user = await userModel.findOne({ $or: query });

        const isMatch = await bcrypt.compare(password, user.password);

        if (!user) {
            return res.status(404).json({ error: 'User not found', code: 404 });
        }
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials', code: 400});
        };

        const token = jwt.sign({
            id: user._id, username: user.username, email: user.email, role: user.role,},
            process.env.JWT_SECRET,
            {expiresIn: '24h'}
        );

        return res.status(200).json({ message: 'Login successfull', token: token, code: 200})
    } catch (error){
        return res.status(500).json({ error: error.message});
    }
};