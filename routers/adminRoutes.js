const express = require("express");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const {
    createService,
    updateService,
    getAllServices,
    createMembership,
    getAllMemberships,
    assignMembership,
    getAllUsers,
    getMembershipData,
    saveMembershipData,
    uploadServiceContent,
    getAllEnquiries,
    deleteEnquiry,
    getAllReferrals,
    updateReferralStatus
} = require("../controllers/adminController");
const { protect, authorizeRoles } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/service", protect, authorizeRoles("admin"), createService);
router.patch("/service/:id", protect, authorizeRoles("admin"), updateService);
router.get("/services", protect, authorizeRoles("admin"), getAllServices);

router.post("/membership", protect, authorizeRoles("admin"), createMembership);
router.get("/memberships", protect, authorizeRoles("admin"), getAllMemberships);

router.post("/assign-membership/:userId", protect, authorizeRoles("admin"), assignMembership);
router.get("/users", protect, authorizeRoles("admin"), getAllUsers);


// router.get("/", getMembershipData);
// router.post("/upload-service-content", protect, authorizeRoles("admin"), uploadServiceContent);
router.post("/upload-service-content", protect, authorizeRoles("admin"), upload.array("files"), uploadServiceContent);

router.post("/edit-membership", protect, authorizeRoles("admin"), saveMembershipData);
router.get("/all", protect, authorizeRoles("admin"), getAllEnquiries);
router.delete("/delete/:id", protect, authorizeRoles("admin"), deleteEnquiry);

router.get("/allRefral", protect, authorizeRoles("admin"), getAllReferrals);
router.put("/update-status/:id", protect, authorizeRoles("admin"), updateReferralStatus);

module.exports = router;

