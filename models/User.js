const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
    businessName: { type: String, required: true, trim: true },
    ownerName: { type: String, required: true, trim: true },
    industry: { type: String, required: true, trim: true },
    contactInfo: { type: String, required: true, trim: true },
    gstOrPan: { type: String, trim: true },

    city: { type: String, trim: true },
    website: { type: String, trim: true },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: { type: String, required: true, minlength: 6, select: false },

    role: { type: String, enum: ["user", "admin"], default: "user" },
    isVerified: { type: Boolean, default: false },

    membership: { type: mongoose.Schema.Types.ObjectId, ref: "Membership", default: null },
    validTill: { type: Date, default: null },

    servicesProgress: [
        {
            serviceId: { type: mongoose.Schema.Types.ObjectId, ref: "Service" },
            completedContents: { type: [String], default: [] },
            totalContents: { type: Number, default: 0 },
            progressPercent: { type: Number, default: 0 },
        },
    ],

    createdAt: { type: Date, default: Date.now },
});

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
