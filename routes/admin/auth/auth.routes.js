const express = require("express");
const router = express.Router();
const authAdminController = require("../../../controller/adminController/authcontroller/authController.js");

router.post("/login", authAdminController.adminLogin);

module.exports = router;    