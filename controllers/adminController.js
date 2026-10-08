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
const sendEmail = require("../utils/sendEmail");


const mongoose = require("mongoose");

const BenefitRequest = require("../models/BenefitRequest");




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
        const users = await User.find()
            .select("email businessName ownerName industry contactInfo gstOrPan membership validTill purchaseDate") // ✅ ADD purchaseDate
            .populate({
                path: "membership",
                populate: {
                    path: "allowedServices",
                    select: "name description planContents",
                },
            });

        const filteredUsers = users.map(user => {
            const userObj = user.toObject();

            const planName = userObj?.membership?.planName;

            if (planName && userObj.membership?.allowedServices) {
                userObj.membership.allowedServices =
                    userObj.membership.allowedServices.map(service => {
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




exports.saveMembershipData = async (req, res) => {
    try {
        console.log("🧾 Body received:", req.body);

        const { plans, benefits } = req.body;

        let parsedPlans;
        let parsedBenefits;

        try {
            parsedPlans =
                typeof plans === "string" ? JSON.parse(plans) : plans;

            parsedBenefits =
                typeof benefits === "string" ? JSON.parse(benefits) : benefits;
        } catch (parseError) {
            console.error("❌ Error parsing JSON data:", parseError);

            return res.status(400).json({
                success: false,
                message: "Invalid plans or benefits format",
            });
        }

        if (!Array.isArray(parsedPlans)) {
            return res.status(400).json({
                success: false,
                message: "Plans must be an array",
            });
        }

        if (!Array.isArray(parsedBenefits)) {
            return res.status(400).json({
                success: false,
                message: "Benefits must be an array",
            });
        }

        parsedBenefits = parsedBenefits.map((benefit) => ({
            ...benefit,
            link: benefit.link || benefit.pdfUrl || "",
        }));

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

        const planMapping = {
            startup: "Startup",
            growth: "GrowthStage",
            matured: "MatureStage",
        };

        for (const plan of parsedPlans) {
            if (!plan?.name) continue;

            const membershipPlanName =
                planMapping[plan.name.toLowerCase().trim()];

            if (!membershipPlanName) continue;

            const price = Number(plan.price);

            if (!Number.isFinite(price) || price < 0) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid price for ${plan.name}`,
                });
            }

            const updatedMembership =
                await Membership.findOneAndUpdate(
                    { planName: membershipPlanName },
                    {
                        $set: {
                            price,
                        },
                    },
                    {
                        new: true,
                    }
                );

            if (!updatedMembership) {
                console.warn(
                    `Membership not found for plan: ${membershipPlanName}`
                );
            }
        }

        return res.json({
            success: true,
            message: "Membership plans and benefits updated successfully",
            data: existingData,
        });
    } catch (err) {
        console.error("💥 Error in saveMembershipData:", err);

        return res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};



exports.uploadServiceContent = async (req, res) => {
    try {
        const {
            userId,
            requestId,
            videoUrl,
        } = req.body;

        const files = req.files || [];

        // -----------------------------------
        // VALIDATION
        // -----------------------------------

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User ID is required",
            });
        }

        if (!requestId) {
            return res.status(400).json({
                success: false,
                message: "Request ID is required",
            });
        }

        const hasVideo =
            typeof videoUrl === "string" &&
            videoUrl.trim() !== "";

        const hasFiles = files.length > 0;

        if (!hasVideo && !hasFiles) {
            return res.status(400).json({
                success: false,
                message:
                    "Please upload at least 1 file OR a video link",
            });
        }

        // -----------------------------------
        // FIND USER
        // -----------------------------------

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // -----------------------------------
        // FIND REQUEST DOCUMENT
        // -----------------------------------

        const requestContent =
            await RequestContent.findOne({
                user: userId,
            });

        if (!requestContent) {
            return res.status(404).json({
                success: false,
                message:
                    "No content request found for this user",
            });
        }

        // -----------------------------------
        // FIND EXACT REQUEST
        // -----------------------------------

        const requestedItem =
            requestContent.requests.id(requestId);

        if (!requestedItem) {
            return res.status(404).json({
                success: false,
                message:
                    "Requested service not found",
            });
        }

        // -----------------------------------
        // GET SERVICE NAME
        // -----------------------------------

        const serviceName =
            requestedItem.service;

        if (!serviceName) {
            return res.status(400).json({
                success: false,
                message:
                    "Service name not found in request",
            });
        }

        const uploadedContents = [];
        const uploadedFiles = [];

        // -----------------------------------
        // SAVE VIDEO URL
        // -----------------------------------

        if (hasVideo) {
            const videoData = {
                serviceName: serviceName,
                title: "Video Content",
                type: "video",
                url: videoUrl.trim(),
                uploadedAt: new Date(),
            };

            user.userContents.push(videoData);

            uploadedContents.push(videoData);
        }

        // -----------------------------------
        // UPLOAD FILES
        // -----------------------------------

        for (const file of files) {
            try {
                const resourceType =
                    file.mimetype &&
                    file.mimetype.includes("video")
                        ? "video"
                        : "auto";

                const uploaded =
                    await cloudinary.uploader.upload(
                        file.path,
                        {
                            resource_type: resourceType,
                            folder: "user_contents",
                        }
                    );

                const viewableUrl =
                    uploaded.secure_url.replace(
                        "/raw/upload/",
                        "/upload/"
                    );

                const fileData = {
                    serviceName: serviceName,
                    title: file.originalname,
                    type:
                        file.mimetype &&
                        file.mimetype.includes("video")
                            ? "video"
                            : "pdf",
                    url: viewableUrl,
                    uploadedAt: new Date(),
                };

                user.userContents.push(fileData);

                uploadedContents.push(fileData);

                uploadedFiles.push(viewableUrl);

                // Delete temporary file
                if (fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                }
            } catch (fileError) {
                console.error(
                    "FILE UPLOAD ERROR:",
                    fileError
                );

                // Try to remove temporary file
                if (file.path && fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                }

                throw fileError;
            }
        }

        // -----------------------------------
        // SAVE USER CONTENT
        // -----------------------------------

        await user.save();

        // -----------------------------------
        // UPDATE REQUEST
        // -----------------------------------

        requestedItem.status = "approved";

        requestedItem.uploadedAt = new Date();

        requestedItem.content = {
            serviceName: serviceName,

            videoUrl: hasVideo
                ? videoUrl.trim()
                : "",

            files: uploadedFiles,
        };

        // -----------------------------------
        // SAVE REQUEST
        // -----------------------------------

        await requestContent.save();

        // -----------------------------------
        // RESPONSE
        // -----------------------------------

        return res.json({
            success: true,

            message:
                "Content uploaded and request approved successfully!",

            request: {
                requestId: requestedItem._id,

                service: requestedItem.service,

                status: requestedItem.status,

                content: requestedItem.content,

                uploadedAt:
                    requestedItem.uploadedAt,
            },

            contents: uploadedContents,
        });

    } catch (error) {
        console.error(
            "UPLOAD ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Internal server error",
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

exports.changeContentServiceStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;

        if (typeof isActive !== "boolean") {
            return res.status(400).json({
                success: false,
                message: "isActive must be true or false",
            });
        }

        const service = await ContentService.findByIdAndUpdate(
            id,
            { isActive },
            {
                new: true,
                runValidators: true,
            }
        );

        if (!service) {
            return res.status(404).json({
                success: false,
                message: "Content service not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: `Content service ${
                isActive ? "activated" : "deactivated"
            } successfully`,
            service,
        });
    } catch (error) {
        console.error("Change Content Service Status Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};




exports.onboardMember = async (req, res) => {
  try {
    const {
      businessName,
      ownerName,
      industry,
      contactInfo,
      gstOrPan,
      city,
      website,
      email,
      password
    } = req.body;

    if (!businessName || !ownerName || !industry || !contactInfo || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be filled"
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "Email already exists"
      });
    }

    const user = await User.create({
      businessName,
      ownerName,
      industry,
      contactInfo,
      gstOrPan,
      city,
      website,
      email,
      password,
    });

    res.status(201).json({
      success: true,
      message: "Member onboarded successfully",
      user
    });

  } catch (err) {
    console.error("Onboard error:", err);
    res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};



exports.assignMembershipToUser = async (req, res) => {
    try {
        const { userId, membershipId } = req.params;

        const membership = await Membership.findById(membershipId);

        if (!membership) {
            return res.status(404).json({
                success: false,
                message: "Membership not found"
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const purchaseDate = new Date();

        const validTill = new Date(purchaseDate);

        validTill.setDate(
            validTill.getDate() + Number(membership.validityDays || 0)
        );

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                membership: membership._id,
                validTill,
                purchaseDate
            },
            {
                new: true
            }
        ).populate("membership");

        // ==========================================
        // GET MEMBERSHIP BENEFITS
        // ==========================================

        const benefitData = await MembershipBenefit.findOne();

        const planIndexMap = {
            Startup: 0,
            GrowthStage: 1,
            MatureStage: 2
        };

        const activePlanIndex = planIndexMap[membership.planName];

        const planBenefits = benefitData?.benefits || [];

        const benefitRows = planBenefits
            .map((benefit) => {
                const count =
                    Number(benefit.values?.[activePlanIndex]) || 0;

                return `
                    <tr>
                        <td style="
                            border: 1px solid #ddd;
                            padding: 12px;
                        ">
                            ${benefit.name || "Benefit"}
                        </td>

                        <td style="
                            border: 1px solid #ddd;
                            padding: 12px;
                            text-align: center;
                        ">
                            ${count}
                        </td>
                    </tr>
                `;
            })
            .join("");

        // ==========================================
        // SEND WELCOME EMAIL
        // ==========================================

        try {
            await sendEmail(
                user.email,

                "Welcome to Alfa CHASE Enterprise Foundation – Your Journey Begins Here",

                `
                <div style="
                    font-family: Arial, Helvetica, sans-serif;
                    max-width: 700px;
                    margin: 0 auto;
                    padding: 30px;
                    color: #333;
                    line-height: 1.6;
                ">

                    <p>Dear Member,</p>

                    <h2 style="color: #b8860b;">
                        Warm Welcome to Alfa CHASE Enterprise Foundation!
                    </h2>

                    <p>
                        We are delighted to welcome you to the
                        <strong>Alfa CHASE Enterprise Foundation (ACEF)</strong>
                        family.
                    </p>

                    <p>
                        Your decision to become a member is an important step
                        towards building a stronger, more professional and
                        growth-oriented business ecosystem for Indian MSMEs.
                    </p>

                    <p>
                        At Alfa CHASE Enterprise Foundation, our objective is to
                        <strong>
                            empower entrepreneurs and MSMEs with the right
                            knowledge, skills, systems, guidance and
                            opportunities to grow and scale their businesses.
                        </strong>
                    </p>

                    <!-- MEMBERSHIP DETAILS -->

                    <div style="
                        background: #f8f8f8;
                        border: 1px solid #ddd;
                        border-radius: 8px;
                        padding: 20px;
                        margin: 25px 0;
                    ">

                        <h2 style="
                            color: #b8860b;
                            margin-top: 0;
                        ">
                            Your Membership Details
                        </h2>

                        <p>
                            <strong>Membership Plan:</strong>
                            ${membership.planName}
                        </p>

                        <p>
                            <strong>Purchase Date:</strong>
                            ${purchaseDate.toLocaleDateString("en-IN")}
                        </p>

                        <p>
                            <strong>Valid Till:</strong>
                            ${validTill.toLocaleDateString("en-IN")}
                        </p>

                        <p>
                            <strong>Validity:</strong>
                            ${membership.validityDays || 0} Days
                        </p>

                    </div>

                    <!-- PLAN BENEFITS -->

                    <h3 style="color: #b8860b;">
                        Your Plan Benefits
                    </h3>

                    <p>
                        As part of your
                        <strong>${membership.planName}</strong>
                        membership, you can access the following benefits:
                    </p>

                    <table style="
                        width: 100%;
                        border-collapse: collapse;
                        margin: 20px 0;
                    ">

                        <thead>
                            <tr style="background: #f1f1f1;">

                                <th style="
                                    border: 1px solid #ddd;
                                    padding: 12px;
                                    text-align: left;
                                ">
                                    Benefit / Service
                                </th>

                                <th style="
                                    border: 1px solid #ddd;
                                    padding: 12px;
                                    text-align: center;
                                ">
                                    Benefit Count
                                </th>

                            </tr>
                        </thead>

                        <tbody>

                            ${
                                benefitRows ||
                                `
                                <tr>
                                    <td
                                        colspan="2"
                                        style="
                                            border: 1px solid #ddd;
                                            padding: 12px;
                                            text-align: center;
                                        "
                                    >
                                        Plan benefits are available in your account.
                                    </td>
                                </tr>
                                `
                            }

                        </tbody>

                    </table>

                    <!-- WHAT YOU CAN EXPECT -->

                    <h3 style="color: #b8860b;">
                        What You Can Expect From Us
                    </h3>

                    <ul>
                        <li>
                            Business and entrepreneurship learning sessions
                        </li>

                        <li>
                            Sales and marketing knowledge
                        </li>

                        <li>
                            Business growth guidance
                        </li>

                        <li>
                            MSME-focused workshops and events
                        </li>

                        <li>
                            Access to practical business tools and resources
                        </li>

                        <li>
                            Networking opportunities with fellow entrepreneurs
                        </li>

                        <li>
                            Guidance on sales team development and business systems
                        </li>

                        <li>
                            Special offers and discounts on selected ACEF programmes
                        </li>

                        <li>
                            Regular updates on upcoming initiatives and opportunities
                        </li>
                    </ul>

                    <p>
                        We encourage you to actively participate in our
                        programmes, connect with fellow members and make the
                        maximum use of your membership.
                    </p>

                    <p>
                        <strong>
                            Your growth is our mission, and your success
                            contributes to a stronger MSME ecosystem.
                        </strong>
                    </p>

                    <!-- SUPPORT -->

                    <h3 style="color: #b8860b;">
                        Need Support?
                    </h3>

                    <p>
                        Our team is always available to assist you.
                    </p>

                    <p>
                        <strong>Alfa CHASE Enterprise Foundation</strong><br>
                        301, 304, 305, Crystal Plaza,<br>
                        New Link Road, Chakala, Andheri East,<br>
                        Mumbai – 400099
                    </p>

                    <p>
                        <strong>Support:</strong> +91 98192 1756<br>

                        <strong>Email:</strong>
                        <a href="mailto:support@alfachase.org">
                            support@alfachase.org
                        </a>
                        <br>

                        <strong>Website:</strong>
                        <a href="http://www.alfachase.org/">
                            www.alfachase.org
                        </a>
                    </p>

                    <p>
                        Once again,
                        <strong>
                            welcome to the Alfa CHASE Enterprise Foundation family.
                        </strong>
                    </p>

                    <p>
                        We look forward to a long-term association and to
                        supporting you in your journey of
                        <strong>Growth, Excellence and Scale.</strong>
                    </p>

                    <p>
                        Warm Regards,<br>
                        <strong>
                            Team Alfa CHASE Enterprise Foundation
                        </strong>
                        <br>
                        <em>
                            Empowering MSMEs. Building Entrepreneurs. Creating Growth.
                        </em>
                    </p>

                </div>
                `
            );

            console.log(
                "Welcome email sent successfully to:",
                user.email
            );

        } catch (emailError) {
            console.error(
                "Membership email failed:",
                emailError
            );
        }

        return res.status(200).json({
            success: true,
            message: `Membership '${membership.planName}' assigned successfully!`,
            data: updatedUser
        });

    } catch (error) {
        console.error(
            "Admin Assign Membership Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};







exports.deleteUser = async (req, res) => {
    const session = await mongoose.startSession();

    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID",
            });
        }

        session.startTransaction();

        const user = await User.findById(id).session(session);

        if (!user) {
            await session.abortTransaction();

            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        if (user.role === "admin") {
            await session.abortTransaction();

            return res.status(403).json({
                success: false,
                message: "Admin user cannot be deleted",
            });
        }

        await BenefitRequest.deleteMany(
            { user: id },
            { session }
        );

        await Enquiry.deleteMany(
            { userId: id },
            { session }
        );

        await Referral.deleteMany(
            { userId: id },
            { session }
        );

        await RequestContent.deleteMany(
            { user: id },
            { session }
        );

        await User.findByIdAndDelete(id, { session });

        await session.commitTransaction();

        return res.status(200).json({
            success: true,
            message: "Member and all related data deleted successfully",
        });
    } catch (error) {
        await session.abortTransaction();

        console.error("Delete User Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to delete member and related data",
            error: error.message,
        });
    } finally {
        session.endSession();
    }
};





