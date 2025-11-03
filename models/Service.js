const mongoose = require("mongoose");

const contentSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        type: { type: String, enum: ["video", "pdf"], required: true },
        url: { type: String, required: true },
    },
    { _id: false }
);

const serviceSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String,
    planContents: {
        Startup: [contentSchema],
        GrowthStage: [contentSchema],
        MatureStage: [contentSchema],
    },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Service", serviceSchema);
