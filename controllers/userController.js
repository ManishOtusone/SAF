const User = require("../models/User");
const Service = require("../models/Service");
const Membership = require("../models/Membership");
const Referral = require("../models/referralSchema");


// In your dashboard controller
// controllers/userController.js
// Update this in your userController.js

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
exports.getDashboard = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate("membership")
      .populate("servicesProgress.serviceId");

    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const services = await Service.find({});
    const progress = user.servicesProgress || [];

    const formattedServices = services.map((service) => {
      const userProgress = progress.find(
        (p) => p.serviceId?.toString() === service._id.toString()
      );

      // Get total contents for user's plan
      const userPlan = user.membership?.planName || "Startup";
      const planContents = service.planContents?.[userPlan] || [];
      const totalFiles = planContents.length;

      const completedCount = userProgress ? userProgress.completedContents.length : 0;
      const percent = totalFiles > 0 ? Math.min((completedCount / totalFiles) * 100, 100) : 0;

      return {
        _id: service._id,
        name: service.name,
        totalContents: totalFiles,
        completedContents: completedCount,
        progressPercent: percent,
        // Include completed content IDs for frontend tracking
        completedContentIds: userProgress ? userProgress.completedContents : []
      };
    });

    res.json({
      success: true,
      membership: user.membership,
      services: formattedServices,
      progress: user.servicesProgress // Send full progress data
    });
  } catch (error) {
    console.error("Error fetching dashboard:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};


exports.getStudyMaterialsForUser = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate("membership");
        if (!user || !user.membership) {
            return res.status(400).json({ success: false, message: "User or membership not found" });
        }

        const plan = user.membership.planName;
        const services = await Service.find();

        const studyMaterials = services.map(service => {
            // Safely get contents for the user's plan
            const planContents = service.planContents || {};
            const rawContents = planContents[plan] || [];

            // Transform and validate contents
            const contents = rawContents
                .map((content, index) => {
                    // Skip invalid content
                    if (!content.title || !content.url || !content.type) {
                        console.warn(`Skipping invalid content for service ${service.name}:`, content);
                        return null;
                    }

                    return {
                        _id: content._id ? content._id.toString() : `content-${service._id}-${index}`,
                        title: content.title.trim(),
                        type: content.type.toLowerCase(), // Ensure consistent casing
                        url: content.url,
                        // Add any additional fields you need
                        ...(content.description && { description: content.description }),
                        ...(content.duration && { duration: content.duration }),
                    };
                })
                .filter(content => content !== null); // Remove null entries

            // Only include services that have contents
            if (contents.length === 0) {
                return null;
            }

            return {
                serviceId: service._id.toString(),
                serviceName: service.name,
                contents,
            };
        }).filter(service => service !== null); // Remove services with no contents

        console.log(`Generated ${studyMaterials.length} study materials for ${plan} plan`);

        res.json({
            success: true,
            plan,
            studyMaterials,
            totalServices: studyMaterials.length,
            totalContents: studyMaterials.reduce((sum, service) => sum + service.contents.length, 0)
        });
    } catch (err) {
        console.error("Error in getStudyMaterialsForUser:", err);
        res.status(500).json({ success: false, message: err.message });
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

        // Validate membership ID
        const membership = await Membership.findById(membershipId);
        if (!membership) {
            return res.status(404).json({ success: false, message: "Membership not found" });
        }

        // Set validity date
        const validTill = new Date();
        validTill.setDate(validTill.getDate() + membership.validityDays);

        // Update user membership
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { membership: membership._id, validTill },
            { new: true }
        ).populate("membership");

        res.status(200).json({
            success: true,
            message: `Membership '${membership.planName}' assigned successfully!`,
            data: updatedUser,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
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

const Enquiry = require("../models/enquirySchema");

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





