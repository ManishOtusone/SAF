const Service = require("../models/Service");
const Membership = require("../models/Membership");
const MembershipBenefit = require("../models/membershipBenefitSchema");
const User = require("../models/User");
const cloudinary = require("../config/cloudinary");
const fs = require("fs");
const Enquiry = require("../models/enquirySchema");
const Referral = require("../models/referralSchema");


// Create new service
exports.createService = async (req, res) => {
    try {
        const service = await Service.create(req.body);
        res.status(201).json({ success: true, service });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// Update service
exports.updateService = async (req, res) => {
    try {
        const service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ success: true, service });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// Get all services
exports.getAllServices = async (req, res) => {
    try {
        const services = await Service.find();
        res.json({ success: true, services });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Create membership plan
exports.createMembership = async (req, res) => {
    try {
        const membership = await Membership.create(req.body);
        res.status(201).json({ success: true, membership });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// Get all memberships
exports.getAllMemberships = async (req, res) => {
    try {
        const memberships = await Membership.find()
            .populate({
                path: "allowedServices",
                select: "name description planContents", // only useful fields
            });

        // Filter allowedServices' planContents according to each membership's planName
        const filteredMemberships = memberships.map(membership => {
            const membershipObj = membership.toObject();
            const planName = membershipObj.planName; // "Startup", "GrowthStage", "MatureStage"

            if (membershipObj.allowedServices && planName) {
                membershipObj.allowedServices = membershipObj.allowedServices.map(service => {
                    const filteredService = { ...service };

                    // Keep only planContents for this membership plan
                    if (filteredService.planContents) {
                        filteredService.planContents = {
                            [planName]: filteredService.planContents[planName] || [],
                        };
                    }

                    return filteredService;
                });
            }

            return membershipObj;
        });

        res.json({
            success: true,
            count: filteredMemberships.length,
            memberships: filteredMemberships,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};



// Assign membership to user (admin action)
exports.assignMembership = async (req, res) => {
    try {
        const { membershipId } = req.body;
        const user = await User.findById(req.params.userId);
        const membership = await Membership.findById(membershipId).populate("allowedServices");

        if (!user || !membership) {
            return res.status(404).json({
                success: false,
                message: "User or Membership not found",
            });
        }

        // 🧮 Calculate validTill date based on membership.validityDays
        const validTill = new Date();
        validTill.setDate(validTill.getDate() + membership.validityDays);

        // Assign membership details
        user.membership = membership._id;
        user.allowedServices = membership.allowedServices || [];
        user.validTill = validTill;

        await user.save();

        res.json({
            success: true,
            message: `Membership '${membership.planName}' assigned successfully.`,
            user: {
                id: user._id,
                plan: membership.planName,
                validTill,
                allowedServicesCount: user.allowedServices.length,
            },
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};



// Get all users
exports.getAllUsers = async (req, res) => {
    try {
        // Fetch all users and populate membership + nested allowed services
        const users = await User.find()
            .populate({
                path: "membership",
                populate: {
                    path: "allowedServices",
                    select: "name description planContents", // optional
                },
            });

        // Filter planContents according to each user's membership plan
        const filteredUsers = users.map(user => {
            const userObj = user.toObject();

            const planName = userObj?.membership?.planName; // "Startup", "GrowthStage", or "MatureStage"

            if (planName && userObj.membership?.allowedServices) {
                userObj.membership.allowedServices = userObj.membership.allowedServices.map(service => {
                    const filteredService = { ...service };

                    if (filteredService.planContents) {
                        filteredService.planContents = {
                            [planName]: filteredService.planContents[planName] || [],
                        };
                    }

                    return filteredService;
                });
            }

            return userObj;
        });

        res.json({
            success: true,
            count: filteredUsers.length,
            users: filteredUsers,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};



// ✅ Get all membership plan data
exports.getMembershipData = async (req, res) => {
    try {
        const data = await MembershipBenefit.findOne(); // single record pattern
        if (!data) return res.status(404).json({ success: false, message: "No data found" });

        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.saveMembershipData = async (req, res) => {
    try {
        const { plans, benefits } = req.body;

        let data = await MembershipBenefit.findOne();
        if (!data) {
            data = new MembershipBenefit({ plans, benefits });
        } else {
            data.plans = plans;
            data.benefits = benefits;
            data.updatedAt = new Date();
        }

        await data.save();
        res.json({ success: true, message: "Membership data saved successfully", data });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};


// exports.uploadServiceContent = async (req, res) => {
//     try {
//         const { serviceName, description } = req.body;
//         const access = {
//             startup: req.body["access[startup]"] === "true" || req.body["access[startup]"] === true,
//             growth: req.body["access[growth]"] === "true" || req.body["access[growth]"] === true,
//             matured: req.body["access[matured]"] === "true" || req.body["access[matured]"] === true,
//         };

//         const files = req.files; // Multer adds this

//         // Validate inputs
//         if (!serviceName || !files || files.length === 0) {
//             return res
//                 .status(400)
//                 .json({ success: false, message: "Service name and files are required" });
//         }

//         // Find or create the service
//         let service = await Service.findOne({ name: serviceName });
//         if (!service) {
//             service = new Service({
//                 name: serviceName,
//                 description: description || "",
//                 planContents: { Startup: [], GrowthStage: [], MatureStage: [] },
//             });
//         }

//         // Upload files to Cloudinary
//         for (const file of files) {
//             const uploaded = await cloudinary.uploader.upload(file.path, {
//                 resource_type: "auto", // supports video or pdf
//                 folder: "service_contents",
//             });

//             const fileType = file.mimetype.includes("video") ? "video" : "pdf";
//             const fileData = {
//                 title: file.originalname,
//                 type: fileType,
//                 url: uploaded.secure_url,
//             };

//             // Add to correct membership plans
//             if (access.startup) service.planContents.Startup.push(fileData);
//             if (access.growth) service.planContents.GrowthStage.push(fileData);
//             if (access.matured) service.planContents.MatureStage.push(fileData);

//             // Delete temp file after upload
//             fs.unlinkSync(file.path);
//         }

//         await service.save();

//         res.json({
//             success: true,
//             message: "Service content uploaded successfully",
//             service,
//         });
//     } catch (error) {
//         console.error("Error uploading content:", error);
//         res.status(500).json({ success: false, message: "Internal server error" });
//     }
// };

exports.uploadServiceContent = async (req, res) => {
    try {
        const { serviceName, access } = req.body;
        const files = req.files;

        // Validate inputs
        if (!serviceName || !files || files.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Service name and files are required"
            });
        }

        // Parse the access JSON string
        let accessControl;
        try {
            accessControl = typeof access === 'string' ? JSON.parse(access) : access;
        } catch (parseError) {
            console.error("Error parsing access control:", parseError);
            return res.status(400).json({
                success: false,
                message: "Invalid access control format"
            });
        }

        console.log("Parsed access control:", accessControl);

        // Find or create the service
        let service = await Service.findOne({ name: serviceName });
        if (!service) {
            service = new Service({
                name: serviceName,
                description: "",
                planContents: {
                    Startup: [],
                    GrowthStage: [],
                    MatureStage: []
                },
            });
        }

        // Upload files to Cloudinary and assign to plans
        for (const file of files) {
            const uploaded = await cloudinary.uploader.upload(file.path, {
                resource_type: "auto",
                folder: "service_contents",
            });

            const fileType = file.mimetype.includes("video") ? "video" : "pdf";
            const fileData = {
                title: file.originalname,
                type: fileType,
                url: uploaded.secure_url,
                publicId: uploaded.public_id,
                uploadedAt: new Date()
            };

            console.log("Adding file to plans:", fileData.title);
            console.log("Access control - startup:", accessControl.startup);
            console.log("Access control - growth:", accessControl.growth);
            console.log("Access control - matured:", accessControl.matured);

            // Add to correct membership plans based on access control
            if (accessControl.startup === true) {
                service.planContents.Startup.push(fileData);
                console.log("✓ Added to Startup plan");
            }
            if (accessControl.growth === true) {
                service.planContents.GrowthStage.push(fileData);
                console.log("✓ Added to GrowthStage plan");
            }
            if (accessControl.matured === true) {
                service.planContents.MatureStage.push(fileData);
                console.log("✓ Added to MatureStage plan");
            }

            // Delete temp file
            try {
                fs.unlinkSync(file.path);
            } catch (unlinkError) {
                console.warn("Could not delete temp file:", unlinkError);
            }
        }

        await service.save();

        res.json({
            success: true,
            message: "Service content uploaded successfully",
            service,
        });
    } catch (error) {
        console.error("Error uploading content:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

exports.getAllEnquiries = async (req, res) => {
    try {
        const list = await Enquiry.find().populate("userId", "email");
        res.status(200).json({ success: true, enquiries: list });
    } catch (error) {
        console.log("Get All Error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

exports.deleteEnquiry = async (req, res) => {
    try {
        const { id } = req.params;

        const deleted = await Enquiry.findByIdAndDelete(id);

        if (!deleted)
            return res.status(404).json({ success: false, message: "Enquiry not found" });

        res.status(200).json({
            success: true,
            message: "Enquiry deleted successfully"
        });
    } catch (error) {
        console.log("Delete Error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};


exports.getAllReferrals = async (req, res) => {
    try {
        const referrals = await Referral.find()
            .populate("userId", "ownerName email")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            referrals
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateReferralStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // "Approved" / "Rejected"

        if (!["Approved", "Rejected", "Pending"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status"
            });
        }

        const referral = await Referral.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        return res.status(200).json({
            success: true,
            message: "Status updated successfully",
            referral
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};




