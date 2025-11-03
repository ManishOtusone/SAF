const mongoose = require("mongoose");

const membershipSchema = new mongoose.Schema({
    planName: {
        type: String,
        enum: ["Startup", "GrowthStage", "MatureStage"],
        required: true,
    },
    price: Number,
    description: String,
    validityDays: { type: Number, required: true },
    allowedServices: [
        { type: mongoose.Schema.Types.ObjectId, ref: "Service" }
    ],
    createdAt: { type: Date, default: Date.now },
});


module.exports = mongoose.model("Membership", membershipSchema);
