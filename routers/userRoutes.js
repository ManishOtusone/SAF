const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const { getDashboard, getStudyMaterialsForUser, updateContentProgress, assignMembership, getFullUserDetails, createEnquiry, createReferral, getMyReferrals } = require("../controllers/userController");
const { getMembershipData, getAllMemberships } = require("../controllers/adminController");

const router = express.Router();

router.get("/dashboard", protect, getDashboard);
// router.post("/update-progress", protect, updateContentProgress);
router.post('/update-content-progress', protect, updateContentProgress);
router.get("/getMembershipsPlans", protect, getMembershipData);
router.get("/study-materials", protect, getStudyMaterialsForUser);
router.post("/assignMembership/:membershipId", protect, assignMembership);
router.get("/allMemberships", protect, getAllMemberships);
router.get("/getDefaultMembershipsPlans", getMembershipData);
router.get("/getAllUserDetails", protect, getFullUserDetails);
router.post("/createEnquiry", protect, createEnquiry);
router.post("/create", protect, createReferral);
router.get("/my-referrals", protect, getMyReferrals);







module.exports = router;
