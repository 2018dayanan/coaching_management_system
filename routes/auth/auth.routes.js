const express = require("express");
const router = express.Router();
const { register, verifyOtp, login, resendOtp, forgotPassword, verifyForgotPasswordOtp, resetPassword, getMyProfile, updateProfile } = require("../../controller/authController/authController");

router.post("/register", register);
router.post("/verifyOtp", verifyOtp);
router.post("/login", login);
router.post("/resendOtp", resendOtp);
router.post("/forgotPassword", forgotPassword);
router.post("/verifyForgotPasswordOtp", verifyForgotPasswordOtp);
router.post("/resetPassword", resetPassword);

module.exports = router;