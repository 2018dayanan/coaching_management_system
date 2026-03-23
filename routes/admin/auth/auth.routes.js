const express = require("express");
const router = express.Router();
const authController = require("../../../controller/admin/auth.controller");

const { protect } = require("../../../middlewares/auth.middleware");

router.post("/login", authController.adminLogin);
router.get("/profile", protect, authController.getAdminProfile);

module.exports = router;