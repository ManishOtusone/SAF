const express = require("express");
const router = express.Router();

// Import sub-routers
const authRoutes = require("./authRoutes");
const adminRoutes = require("./adminRoutes");
const userRoutes = require("./userRoutes");

// Mount routers
router.use("/auth", authRoutes);
router.use("/admin", adminRoutes);
router.use("/user", userRoutes);

router.get("/", (req, res) => {
    res.send("API is running 🚀");
});

module.exports = router;
