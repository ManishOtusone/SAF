const mongoose = require("mongoose");

const requestContentSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        requests: [
            {
                service: { type: String, required: true },
                content: { type: String, default: "" }, 
            },
        ],
    },
    { timestamps: true }
);

module.exports = mongoose.model("RequestContent", requestContentSchema);
