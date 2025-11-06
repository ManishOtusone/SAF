const User = require('../models/User');
const jwt = require('jsonwebtoken');
const axios = require("axios");


const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET || 'secretkey', { expiresIn: '30d' });


exports.signup = async (req, res) => {
    try {
        const {
            businessName,
            ownerName,
            industry,
            contactInfo,
            gstOrPan,
            city,
            website,
            email,
            password,
            captchaToken
        } = req.body;

        // ✅ 1. Validate required fields
        if (!businessName || !ownerName || !industry || !contactInfo || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "All required fields must be filled"
            });
        }

        // ✅ 2. Validate captcha token
        if (!captchaToken) {
            return res.status(400).json({
                success: false,
                message: "Captcha verification failed"
            });
        }

        // ✅ 3. Verify captcha with Google
        const secretKey = process.env.RECAPTCHA_SECRET_KEY;

        const googleVerifyURL = `https://www.google.com/recaptcha/api/siteverify`;

        const { data } = await axios.post(
            googleVerifyURL,
            {},
            {
                params: {
                    secret: secretKey,
                    response: captchaToken
                }
            }
        );

        if (!data.success) {
            return res.status(400).json({
                success: false,
                message: "Captcha validation failed. Please try again."
            });
        }

        // ✅ 4. Check existing email
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({
                success: false,
                message: "Email already exists"
            });
        }

        // ✅ 5. Create user
        const user = await User.create({
            businessName,
            ownerName,
            industry,
            contactInfo,
            gstOrPan,
            city,
            website,
            email,
            password
        });

        // ✅ 6. Successful response
        res.status(201).json({
            success: true,
            message: "User registered successfully",
            token: generateToken(user._id),
            user
        });

    } catch (err) {
        console.error("Signup error:", err);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
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
