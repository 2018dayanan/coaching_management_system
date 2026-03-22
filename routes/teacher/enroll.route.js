const express = require("express");
const router = express.Router();
const enrollmentController = require("../../controller/teacher/enrollmentController");
const teacherMiddleware = require("../../middlewares/teacherMiddleware");

router.use(teacherMiddleware);

router.post("/enroll", enrollmentController.enrollStudents);

// Endpoint to fetch all students for a specific batch
router.get("/batch/:batch_id", enrollmentController.getStudentsByBatchId);

module.exports = router;
