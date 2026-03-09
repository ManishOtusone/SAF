const ContentService = require("../models/ContentService");

const User = require("../models/User");
const Service = require("../models/Service");
const Membership = require("../models/Membership");
const Referral = require("../models/referralSchema");
const RequestContent = require("../models/requestContentModel");
const Enquiry = require("../models/enquirySchema");
const sendEmail = require("../utils/sendEmail");
const baseUrl = process.env.BASE_URL;






exports.updateContentProgress = async (req, res) => {
    try {
        const userId = req.user._id;
        const { serviceId, contentId, contentUrl } = req.body;

        if (!serviceId || !contentId) {
            return res.status(400).json({
                success: false,
                message: "serviceId and contentId are required",
            });
        }

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        // Get service to verify content exists and get total count
        const service = await Service.findById(serviceId);
        if (!service) {
            return res.status(404).json({
                success: false,
                message: "Service not found",
            });
        }

        // Determine user's plan and get total contents for that plan
        const userPlan = user.membership?.planName || "Startup"; // fallback
        const planContents = service.planContents?.[userPlan] || [];
        const totalContents = planContents.length;

        // Find or create progress record
        let progressIndex = user.servicesProgress.findIndex(
            (p) => p.serviceId.toString() === serviceId.toString()
        );

        if (progressIndex === -1) {
            // Create new progress record
            user.servicesProgress.push({
                serviceId,
                completedContents: [contentId],
                totalContents,
                progressPercent: totalContents > 0 ? (1 / totalContents) * 100 : 0,
            });
        } else {
            // Update existing progress record
            const progress = user.servicesProgress[progressIndex];

            // Only add if not already completed
            if (!progress.completedContents.includes(contentId)) {
                progress.completedContents.push(contentId);
                progress.totalContents = totalContents;

                const completedCount = progress.completedContents.length;
                progress.progressPercent = totalContents > 0
                    ? Math.min((completedCount / totalContents) * 100, 100)
                    : 0;
            }
        }

        // Mark the array as modified
        user.markModified("servicesProgress");
        await user.save();

        const updatedProgress = user.servicesProgress.find(
            (p) => p.serviceId.toString() === serviceId.toString()
        );

        res.json({
            success: true,
            message: "Progress updated successfully",
            progress: {
                completed: updatedProgress.completedContents.length,
                total: updatedProgress.totalContents,
                percent: updatedProgress.progressPercent,
            },
        });
    } catch (err) {
        console.error("Error in updateContentProgress:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// Update the dashboard controller to include completed content IDs
// exports.getDashboard = async (req, res) => {
//     try {
//         const user = await User.findById(req.user.id)
//             .populate("membership")
//             .select("membership validTill userContents userCompletedContents"); // ⭐ FIX HERE

//         if (!user) {
//             return res.status(404).json({ success: false, message: "User not found" });
//         }

//         const totalStudyMaterials = user.userContents.length;
//         const completedMaterials = user.userCompletedContents.length;

//         const percent =
//             totalStudyMaterials > 0
//                 ? Math.round((completedMaterials / totalStudyMaterials) * 100)
//                 : 0;

//         return res.json({
//             success: true,

//             membership: {
//                 ...user.membership.toObject(),
//                 validTill: user.validTill  // ⭐ validTill now available
//             },

//             totalStudyMaterials,
//             completedMaterials,
//             percent,
//             studyMaterials: user.userContents,
//             completedList: user.userCompletedContents
//         });

//     } catch (error) {
//         console.error("Dashboard Error:", error);
//         return res.status(500).json({ success: false, message: "Internal server error" });
//     }
// };

exports.getDashboard = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .populate("membership")
            .select("membership validTill userContents purchaseDate userCompletedContents");

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const totalStudyMaterials = user.userContents.length;
        let completedMaterials = user.userCompletedContents.length;

        // ⭐⭐ FIX: Prevent completed > total
        if (completedMaterials > totalStudyMaterials) {
            completedMaterials = totalStudyMaterials;
        }

        const percent =
            totalStudyMaterials > 0
                ? Math.round((completedMaterials / totalStudyMaterials) * 100)
                : 0;

        return res.json({
            success: true,

            membership: {
                ...user.membership.toObject(),
                validTill: user.validTill,
                purchaseDate: user.purchaseDate
            },

            totalStudyMaterials,
            completedMaterials, // ⭐ FIX APPLIED
            percent,
            studyMaterials: user.userContents,
            completedList: user.userCompletedContents
        });

    } catch (error) {
        console.error("Dashboard Error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};



exports.createRequestContent = async (req, res) => {
    try {
        const { selectedServices } = req.body;

        const newReq = await RequestContent.create({
            user: req.user._id,
            requests: selectedServices.map(service => ({
                service,
                content: ""
            }))
        });

        return res.json({ success: true, message: "Content saved", data: newReq });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};



exports.getStudyMaterialsForUser = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .select("userContents membership userCompletedContents")
            .populate("membership");

        return res.json({
            success: true,
            plan: user.membership?.planName || "No Plan",
            studyMaterials: user.userContents || [],
            completed: user.userCompletedContents || []
        });

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};


exports.markStudyMaterialComplete = async (req, res) => {
    try {
        const userId = req.user._id;
        const { contentId } = req.body;

        if (!contentId) {
            return res.status(400).json({
                success: false,
                message: "contentId is required"
            });
        }

        const user = await User.findById(userId);

        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        const alreadyDone = user.userCompletedContents.some(c => c.contentId === contentId);

        if (!alreadyDone) {
            user.userCompletedContents.push({
                contentId,
                completedAt: new Date()
            });
        }

        await user.save();

        res.json({
            success: true,
            message: "Marked as completed",
            completedCount: user.userCompletedContents.length,
            totalMaterials: user.userContents.length
        });

    } catch (error) {
        console.error("markStudyMaterialComplete Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};




exports.getAllMembersip = async (req, res) => {
    try {
        const memberships = await Membership.find();
        res.status(200).json({ success: true, data: memberships });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server error" });
    }
}



exports.assignMembership = async (req, res) => {
    try {
        const userId = req.user._id;
        const { membershipId } = req.params;

        // 1️⃣ Validate membership
        const membership = await Membership.findById(membershipId);
        if (!membership) {
            return res.status(404).json({
                success: false,
                message: "Membership not found"
            });
        }

        // 2️⃣ Calculate validTill from validityDays
        const validTill = new Date();
        validTill.setDate(validTill.getDate() + membership.validityDays);

        // 3️⃣ Assign membership + validTill into user
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                membership: membership._id,
                validTill,
                purchaseDate: new Date()
            },
            { new: true }
        ).populate("membership");

        return res.status(200).json({
            success: true,
            message: `Membership '${membership.planName}' assigned successfully!`,
            data: updatedUser
        });

    } catch (error) {
        console.error("Assign Membership Error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};



exports.getFullUserDetails = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: Invalid token",
            });
        }

        const user = await User.findById(req.user._id)
            .select("-password")
            .populate("membership")
            .populate("servicesProgress.serviceId");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "User details fetched successfully",
            data: user,
        });
    } catch (error) {
        console.error("getFullUserDetails error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};


exports.createEnquiry = async (req, res) => {
    try {
        const userId = req.user._id;

        const { name, phone, description } = req.body;

        if (!name || !phone || !description)
            return res.status(400).json({ success: false, message: "All fields are required" });

        const enquiry = await Enquiry.create({
            userId,
            name,
            phone,
            description
        });

        res.status(201).json({
            success: true,
            message: "Enquiry submitted successfully",
            enquiry
        });
    } catch (error) {
        console.log("Create Enquiry Error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// controllers/referralController.js

exports.createReferral = async (req, res) => {
    try {
        const { name, contactNumber, companyName, email } = req.body;

        if (!name || !contactNumber || !companyName || !email) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        const referral = await Referral.create({
            name,
            contactNumber,
            companyName,
            email,
            userId: req.user._id
        });

        return res.status(201).json({
            success: true,
            message: "Referral submitted successfully",
            referral
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.getMyReferrals = async (req, res) => {
    try {
        const referrals = await Referral.find({ userId: req.user._id }).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            referrals
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.getMyRequestedContent = async (req, res) => {
    try {
        const data = await RequestContent.findOne({ user: req.user._id });

        return res.json({
            success: true,
            data: data ? data.requests : []
        });

    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};


exports.getActiveContentForUser = async (req, res) => {
    try {
        const services = await ContentService.find({ isActive: true }).sort("name");

        return res.json({
            success: true,
            data: services,
        });

    } catch (error) {
        console.log("User Content Error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};


exports.sendOtp = async (req, res) => {
    try {

        const { email } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        user.otp = otp;
        user.otpExpiry = Date.now() + 10 * 60 * 1000;

        await user.save();

        const emailTemplate = `
      <div style="font-family: Arial, sans-serif; background:#f4f6f8; padding:30px;">
        <div style="max-width:600px; margin:auto; background:white; border-radius:10px; overflow:hidden; box-shadow:0 4px 10px rgba(0,0,0,0.08);">

          <!-- Header -->
          <div style="background:#2563eb; padding:20px; text-align:center; color:white;">
            <h2 style="margin:0;">Alfa Chase Enterprise Foundation</h2>
          </div>

          <!-- Body -->
          <div style="padding:30px; text-align:center;">
            <h3 style="color:#333;">Password Reset Request</h3>
            <p style="color:#555; font-size:15px;">
              We received a request to reset your password. Please use the OTP below to continue.
            </p>

            <div style="
              font-size:32px;
              letter-spacing:6px;
              font-weight:bold;
              color:#2563eb;
              background:#f1f5f9;
              padding:15px;
              border-radius:8px;
              display:inline-block;
              margin:20px 0;
            ">
              ${otp}
            </div>

            <p style="color:#666; font-size:14px;">
              This OTP is valid for <b>10 minutes</b>.
            </p>

            <p style="color:#777; font-size:13px;">
              If you did not request a password reset, please ignore this email.
            </p>
          </div>

          <!-- Footer -->
          <div style="background:#f1f5f9; padding:20px; text-align:center; font-size:13px; color:#555;">
            Regards,<br>
            <b>Support Team</b><br>
            Alfa Chase Enterprise Foundation
          </div>

        </div>
      </div>
    `;

        await sendEmail(
            email,
            "Password Reset OTP - Alfa Chase Enterprise Foundation",
            emailTemplate
        );

        res.json({
            success: true,
            message: "OTP sent to email"
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

exports.verifyOtp = async (req, res) => {
    try {

        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: "Email and OTP are required"
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (!user.otpExpiry || user.otpExpiry < Date.now()) {
            return res.status(400).json({
                success: false,
                message: "OTP expired"
            });
        }

        if (user.otp.toString() !== otp.toString()) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP"
            });
        }

        res.json({
            success: true,
            message: "OTP verified successfully"
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

exports.resetPassword = async (req, res) => {

    try {

        const { email, password } = req.body;

        const user = await User.findOne({ email }).select("+password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        user.password = password;
        user.otp = null;
        user.otpExpiry = null;

        await user.save();

        res.json({
            success: true,
            message: "Password updated successfully"
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};





