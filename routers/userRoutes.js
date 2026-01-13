const express = require("express");
const { protect } = require("../middlewares/authMiddleware");

const {
    getDashboard,
    getStudyMaterialsForUser,
    updateContentProgress,
    assignMembership,
    getFullUserDetails,
    createEnquiry,
    createReferral,
    getMyReferrals,
    createRequestContent,
    getMyRequestedContent,
    markStudyMaterialComplete,
    getActiveContentForUser,   
} = require("../controllers/userController");

const {
    getMembershipData,
    getAllMemberships
} = require("../controllers/adminController");

const router = express.Router();

router.get("/dashboard", protect, getDashboard);

router.post("/update-content-progress", protect, updateContentProgress);
router.post("/complete-study-material", protect, markStudyMaterialComplete);   

router.get("/getMembershipsPlans", protect, getMembershipData);
router.post("/assignMembership/:membershipId", protect, assignMembership);
router.get("/allMemberships", protect, getAllMemberships);

router.get("/getAllUserDetails", protect, getFullUserDetails);

router.get("/study-materials", protect, getStudyMaterialsForUser);  

router.post("/createEnquiry", protect, createEnquiry);

router.post("/create", protect, createReferral);
router.get("/my-referrals", protect, getMyReferrals);

router.post("/request-content", protect, createRequestContent);
router.get("/my-requested-content", protect, getMyRequestedContent);
router.get("/getDefaultMembershipsPlans",getMembershipData);

router.get("/content-options" , getActiveContentForUser);



module.exports = router;
