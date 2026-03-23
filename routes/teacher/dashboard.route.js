const express = require("express");
const router = express.Router();
const dashboardController = require("../../controller/teacher/dashboard.controller");

router.get("/", dashboardController.getTeacherStats);

module.exports = router;
