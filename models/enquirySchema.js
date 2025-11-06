const mongoose = require("mongoose");

const enquirySchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        name: {
            type: String,
            required: true,
            trim: true
        },
        phone: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            required: true,
            trim: true
        },

    },
    { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("Enquiry", enquirySchema);
