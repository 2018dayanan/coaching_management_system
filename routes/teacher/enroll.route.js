const express = require("express");
const router = express.Router();
const enrollmentController = require("../../controller/teacher/enrollment.controller");

router.post("/students", enrollmentController.enrollStudents);
router.get("/students/:batch_id", enrollmentController.getStudentsByBatchId);

module.exports = router;
