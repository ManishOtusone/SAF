const Service = require("../models/Service");
const Membership = require("../models/Membership");
const MembershipBenefit = require("../models/membershipBenefitSchema");
const User = require("../models/User");
const cloudinary = require("../config/cloudinary");
const fs = require("fs");
const Enquiry = require("../models/enquirySchema");
const Referral = require("../models/referralSchema");
const path = require("path");
const RequestContent = require("../models/requestContentModel");
const ContentService = require("../models/ContentService.js");




exports.createService = async (req, res) => {
    try {
        const service = await Service.create(req.body);
        res.status(201).json({ success: true, service });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.updateService = async (req, res) => {
    try {
        const service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ success: true, service });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.getAllServices = async (req, res) => {
    try {
        const services = await Service.find();
        res.json({ success: true, services });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.createMembership = async (req, res) => {
    try {
        const membership = await Membership.create(req.body);
        res.status(201).json({ success: true, membership });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.getAllMemberships = async (req, res) => {
    try {
        const memberships = await Membership.find()
            .populate({
                path: "allowedServices",
                select: "name description planContents",
            });

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

exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;

        const updatedUser = await User.findByIdAndUpdate(
            id,
            {
                email: req.body.email,
                businessName: req.body.businessName,
                ownerName: req.body.ownerName,
                industry: req.body.industry,
                contactInfo: req.body.contactInfo,
                gstOrPan: req.body.gstOrPan,
            },
            { new: true, runValidators: true }
        ).populate({
            path: "membership",
            populate: {
                path: "allowedServices",
                select: "name description planContents",
            },
        });

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        res.json({
            success: true,
            message: "User updated successfully",
            user: updatedUser,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};



exports.getMembershipData = async (req, res) => {
    try {
        const data = await MembershipBenefit.findOne(); // single record pattern
        if (!data) return res.status(404).json({ success: false, message: "No data found" });

        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};




// ✅ Save or update Membership Data (with links only)
exports.saveMembershipData = async (req, res) => {
    try {
        console.log("🧾 Body received:", req.body);

        const { plans, benefits } = req.body;

        // ✅ Parse JSON safely
        let parsedPlans, parsedBenefits;
        try {
            parsedPlans = typeof plans === "string" ? JSON.parse(plans) : plans;
            parsedBenefits = typeof benefits === "string" ? JSON.parse(benefits) : benefits;
        } catch (parseError) {
            console.error("❌ Error parsing JSON data:", parseError);
            return res.status(400).json({
                success: false,
                message: "Invalid plans or benefits format",
            });
        }

        // ✅ Replace pdfUrl → link for safety if frontend still sends pdfUrl
        parsedBenefits = parsedBenefits.map((benefit) => ({
            ...benefit,
            link: benefit.link || benefit.pdfUrl || "",
        }));

        // ✅ Save or update membership data in MongoDB
        let existingData = await MembershipBenefit.findOne();

        if (!existingData) {
            existingData = new MembershipBenefit({
                plans: parsedPlans,
                benefits: parsedBenefits,
            });
        } else {
            existingData.plans = parsedPlans;
            existingData.benefits = parsedBenefits;
            existingData.updatedAt = new Date();
        }

        await existingData.save();

        res.json({
            success: true,
            message: "✅ Membership data (with links) updated successfully",
            data: existingData,
        });
    } catch (err) {
        console.error("💥 Error in saveMembershipData:", err);
        res.status(500).json({
            success: false,
            message: err.message,
        });
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
        const { userId, videoUrl } = req.body;
        const files = req.files || [];

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User ID is required",
            });
        }

        const hasVideo = videoUrl && videoUrl.trim() !== "";
        const hasFiles = files.length > 0;

        if (!hasVideo && !hasFiles) {
            return res.status(400).json({
                success: false,
                message: "Please upload at least 1 file OR a video link",
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        const uploadedContents = [];

        // ⭐ Save Video URL
        if (hasVideo) {
            const videoData = {
                title: "Video Content",
                type: "video",
                url: videoUrl,
                uploadedAt: new Date(),
            };

            user.userContents.push(videoData);
            uploadedContents.push(videoData);
        }

        // ⭐ Save Uploaded Files
        for (const file of files) {
            const resourceType = file.mimetype.includes("video") ? "video" : "auto";

            const uploaded = await cloudinary.uploader.upload(file.path, {
                resource_type: resourceType,
                folder: "user_contents",
            });

            const viewableUrl = uploaded.secure_url.replace("/raw/upload/", "/upload/");

            const fileData = {
                title: file.originalname,
                type: file.mimetype.includes("video") ? "video" : "pdf",
                url: viewableUrl,
                uploadedAt: new Date(),
            };

            user.userContents.push(fileData);
            uploadedContents.push(fileData);

            fs.unlinkSync(file.path);
        }

        await user.save();

        return res.json({
            success: true,
            message: "Content uploaded successfully!",
            contents: uploadedContents,
        });

    } catch (error) {
        console.error("UPLOAD ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
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

exports.getAllContentRequests = async (req, res) => {
    try {
        const requests = await RequestContent.find()
            .populate("user", "ownerName businessName email contactInfo industry city")
            .sort({ createdAt: -1 });

        return res.json({
            success: true,
            message: "All content requests fetched successfully",
            data: requests,
        });

    } catch (err) {
        console.error("GET CONTENT REQUEST ERROR:", err);
        return res.status(500).json({ success: false, message: err.message });
    }
};



exports.createContentService = async (req, res) => {
    try {
        const { name } = req.body;

        if (!name)
            return res.status(400).json({ success: false, message: "Name is required" });

        const exists = await ContentService.findOne({ name });
        if (exists)
            return res.status(400).json({ success: false, message: "Content already exists" });

        const service = await ContentService.create({ name });

        return res.json({
            success: true,
            message: "Content created successfully",
            service,
        });

    } catch (error) {
        console.log("Create Content Error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.getAllContentServices = async (req, res) => {
    try {
        const services = await ContentService.find().sort({ createdAt: -1 });

        return res.json({
            success: true,
            data: services,
        });

    } catch (error) {
        console.log("Get Content Error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};



exports.updateContentService = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, isActive } = req.body;

        const updated = await ContentService.findByIdAndUpdate(
            id,
            { name, isActive },
            { new: true }
        );

        if (!updated)
            return res.status(404).json({ success: false, message: "Content not found" });

        return res.json({
            success: true,
            message: "Content updated successfully",
            updated,
        });

    } catch (error) {
        console.log("Update Content Error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};


exports.deleteContentService = async (req, res) => {
    try {
        const { id } = req.params;

        const deleted = await ContentService.findByIdAndDelete(id);

        if (!deleted)
            return res.status(404).json({ success: false, message: "Content not found" });

        return res.json({
            success: true,
            message: "Content deleted successfully",
        });

    } catch (error) {
        console.log("Delete Content Error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};






