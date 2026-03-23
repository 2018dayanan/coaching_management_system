const express = require("express");
const router = express.Router();
const studentsController = require("../../controller/teacher/students.controller");

router.get("/", studentsController.getMyStudents);
router.get("/submissions", studentsController.getTaskSubmissions);
router.patch("/submissions/review/:submission_id", studentsController.reviewSubmission);
router.get("/:student_id", studentsController.getStudentDetail);

module.exports = router;