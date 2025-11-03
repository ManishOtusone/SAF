const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET || 'secretkey', { expiresIn: '30d' });

exports.signup = async (req, res) => {
    try {
        const { businessName, ownerName, industry, contactInfo, gstOrPan, email, password } = req.body;

        if (!businessName || !ownerName || !industry || !contactInfo || !email || !password)
            return res.status(400).json({ success: false, message: 'All fields required' });

        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ success: false, message: 'Email already exists' });

        const user = await User.create({ businessName, ownerName, industry, contactInfo, gstOrPan, email, password });

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            token: generateToken(user._id),
            user,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email }).select('+password');
        if (!user || !(await user.comparePassword(password)))
            return res.status(401).json({ success: false, message: 'Invalid credentials' });

        res.json({
            success: true,
            token: generateToken(user._id),
            user: { id: user._id, email: user.email, role: user.role },
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
