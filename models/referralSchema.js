// models/referralSchema.js
const mongoose = require("mongoose");

const referralSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },

    contactNumber: {
        type: String,
        required: true,
        trim: true
    },

    companyName: {
        type: String,
        required: true,
        trim: true
    },

    email: {
        type: String,
        required: true,
        trim: true
    },

    status: {
        type: String,
        enum: ["Pending", "Approved", "Rejected"],
        default: "Pending"
    },

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }

}, { timestamps: true });

module.exports = mongoose.model("Referral", referralSchema);
