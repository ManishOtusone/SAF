const express = require("express");
const router = express.Router();
const upload = require("../middlewares/multer");
const { protect, authorizeRoles } = require("../middlewares/authMiddleware");
const {
    createService, updateService, getAllServices,
    createMembership, getAllMemberships, assignMembership, getAllUsers,
    getMembershipData, saveMembershipData, uploadServiceContent,
    getAllEnquiries, deleteEnquiry, getAllReferrals, updateReferralStatus,
    getAllContentRequests,
    createContentService,
    getAllContentServices,
    updateContentService,
    deleteContentService,
    updateUser,
    onboardMember
} = require("../controllers/adminController");

router.post("/service", protect, authorizeRoles("admin"), createService);
router.patch("/service/:id", protect, authorizeRoles("admin"), updateService);
router.get("/services", protect, authorizeRoles("admin"), getAllServices);

router.post("/membership", protect, authorizeRoles("admin"), createMembership);
router.get("/memberships", protect, authorizeRoles("admin"), getAllMemberships);
router.post("/assign-membership/:userId", protect, authorizeRoles("admin"), assignMembership);
router.post("/edit-membership", protect, authorizeRoles("admin"), upload.any(), saveMembershipData);

router.post("/upload-service-content", protect, authorizeRoles("admin"), upload.array("files"), uploadServiceContent);

router.get("/users", protect, authorizeRoles("admin"), getAllUsers);
router.patch("/users/:id",protect,authorizeRoles("admin"),updateUser);

router.get("/all", protect, authorizeRoles("admin"), getAllEnquiries);
router.delete("/delete/:id", protect, authorizeRoles("admin"), deleteEnquiry);

router.get("/allRefral", protect, authorizeRoles("admin"), getAllReferrals);
router.put("/update-status/:id", protect, authorizeRoles("admin"), updateReferralStatus);

router.get("/content-requests", protect, authorizeRoles("admin"), getAllContentRequests);



router.post("/upload-content", protect, authorizeRoles("admin"), createContentService);
router.get("/get-all-content", protect, authorizeRoles("admin"), getAllContentServices);
router.patch("/update-content/:id", protect, authorizeRoles("admin"), updateContentService);
router.delete("/delete-content/:id", protect, authorizeRoles("admin"), deleteContentService);

router.post("/onboard-member",protect, authorizeRoles("admin"),onboardMember);

module.exports = router;
