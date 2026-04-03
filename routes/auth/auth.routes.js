const express = require("express");
const router = express.Router();
const authController = require("../../controller/auth.controller");
const { authLimiter } = require("../../middlewares/rateLimiter.middleware");

router.post("/login", authLimiter, authController.login);
router.post("/send-otp", authLimiter, authController.sendOtp);
router.post("/verify-otp", authLimiter, authController.verifyOtp);

module.exports = router;