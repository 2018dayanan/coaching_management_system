const express = require("express");
const router = express.Router();
const courseController = require("../../controller/user/course/courseController");
const authMiddleware = require("../../middlewares/authMiddleware");

// Student authentication required
router.use(authMiddleware);

router.get("/", courseController.getMyEnrolledCourses);

module.exports = router;
