const express = require("express");
const { signup, login } = require("../controllers/authController");
const { resetPassword, sendOtp, verifyOtp } = require("../controllers/userController");
const router = express.Router();

// Public routes
router.post("/signup", signup);
router.post("/login", login);

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);

module.exports = router;
