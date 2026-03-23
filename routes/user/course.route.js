const express = require("express");
const router = express.Router();
const courseController = require("../../controller/user/course.controller");

router.get("/", courseController.getMyEnrolledCourses);

module.exports = router;
