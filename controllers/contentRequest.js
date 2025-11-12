const RequestContent = require("../models/requestContentModel");

exports.createRequestContent = async (req, res) => {
  try {
    const { requests } = req.body;

    // ✅ Step 1: Validate user
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: user information missing from request.",
      });
    }

    // Get user ID safely (works whether it's _id or id)
    const userId = req.user._id || req.user.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User ID not found in request.",
      });
    }

    // ✅ Step 2: Validate payload
    if (!requests || !Array.isArray(requests) || requests.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide at least one service with content.",
      });
    }

    // Filter out empty service names
    const validRequests = requests.filter(
      (r) => r.service && r.service.trim() !== ""
    );

    if (validRequests.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid service data provided.",
      });
    }

    // ✅ Step 3: Log for debugging (optional)
    console.log("📥 User submitting content:", userId);
    console.log("📦 Services submitted:", validRequests.length);

    // ✅ Step 4: Save to database
    const newRequest = await RequestContent.create({
      user: userId,
      requests: validRequests,
    });

    // ✅ Step 5: Send success response
    res.status(201).json({
      success: true,
      message: "Requests submitted successfully!",
      data: newRequest,
    });
  } catch (error) {
    console.error("❌ Error creating request:", error.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// 📋 Optional: Get all requests
exports.getAllRequests = async (req, res) => {
  try {
    const allRequests = await RequestContent.find()
      .populate("user", "businessName ")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: allRequests.length,
      data: allRequests,
    });
  } catch (error) {
    console.error("❌ Error fetching requests:", error.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
