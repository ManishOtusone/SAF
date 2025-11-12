const express = require("express");
const router = express.Router();
const upload = require("../middlewares/multer");
const { protect, authorizeRoles } = require("../middlewares/authMiddleware");
const {
    createService, updateService, getAllServices,
    createMembership, getAllMemberships, assignMembership, getAllUsers,
    getMembershipData, saveMembershipData, uploadServiceContent,
    getAllEnquiries, deleteEnquiry, getAllReferrals, updateReferralStatus
} = require("../controllers/adminController");
const { getAllRequests } = require("../controllers/contentRequest");

/* SERVICE ROUTES */
router.post("/service", protect, authorizeRoles("admin"), createService);
router.patch("/service/:id", protect, authorizeRoles("admin"), updateService);
router.get("/services", protect, authorizeRoles("admin"), getAllServices);

/* MEMBERSHIP ROUTES */
router.post("/membership", protect, authorizeRoles("admin"), createMembership);
router.get("/memberships", protect, authorizeRoles("admin"), getAllMemberships);
router.post("/assign-membership/:userId", protect, authorizeRoles("admin"), assignMembership);
router.post("/edit-membership", protect, authorizeRoles("admin"), upload.any(), saveMembershipData);

/* SERVICE CONTENT UPLOAD (PDF / VIDEO) */
router.post("/upload-service-content", protect, authorizeRoles("admin"), upload.array("files"), uploadServiceContent);

/* USER & ENQUIRY ROUTES */
router.get("/users", protect, authorizeRoles("admin"), getAllUsers);
router.get("/all", protect, authorizeRoles("admin"), getAllEnquiries);
router.delete("/delete/:id", protect, authorizeRoles("admin"), deleteEnquiry);

/* REFERRAL ROUTES */
router.get("/allRefral", protect, authorizeRoles("admin"), getAllReferrals);
router.put("/update-status/:id", protect, authorizeRoles("admin"), updateReferralStatus);

/* CONTENT REQUEST ROUTES */
router.get("/get-all-request", protect, authorizeRoles("admin"), getAllRequests);

module.exports = router;
