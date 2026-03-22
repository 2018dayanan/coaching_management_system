const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const { getMyProfile, updateProfile } = require("../../controller/authController/authController");

router.get("/myprofile", authMiddleware, getMyProfile);
router.patch("/updateProfile", authMiddleware, updateProfile);

module.exports = router;