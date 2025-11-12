const multer = require("multer");
const path = require("path");

// Temporary storage for files before uploading to Cloudinary
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/"); // make sure this folder exists
    },
    filename: (req, file, cb) => {
        cb(
            null,
            file.fieldname + "-" + Date.now() + path.extname(file.originalname)
        );
    },
});

// File type filter (only PDF and video)
const fileFilter = (req, file, cb) => {
    const allowedTypes = ["application/pdf", "video/mp4", "video/mkv", "video/avi"];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Invalid file type. Only PDF and video files are allowed."));
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 100 * 1024 * 1024 }, // limit: 100MB
});

module.exports = upload;
