const express = require("express");
const router = express.Router();
const authController = require("../../../controller/admin/auth.controller");

router.post("/login", authController.adminLogin);

module.exports = router;