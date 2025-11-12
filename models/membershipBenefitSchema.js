const mongoose = require("mongoose");

const planSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: String, required: true },
});

const benefitSchema = new mongoose.Schema({
    name: { type: String, required: true },
    values: {
        type: [mongoose.Schema.Types.Mixed],
        required: true,
        validate: (v) => v.length === 3,
    },
    link: { type: String, default: "" }, 
});

const membershipBenefitSchema = new mongoose.Schema({
    plans: [planSchema],
    benefits: [benefitSchema],
    updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("MembershipBenefit", membershipBenefitSchema);
