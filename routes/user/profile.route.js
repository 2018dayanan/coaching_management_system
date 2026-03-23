const express = require("express");
const router = express.Router();
const authController = require("../../controller/auth.controller");

router.get("/profile", authController.getMyProfile);
router.patch("/profile", authController.updateProfile);

module.exports = router;
