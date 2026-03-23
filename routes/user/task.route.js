const express = require("express");
const router = express.Router();
const taskController = require("../../controller/user/task.controller");

router.get("/", taskController.getMyTasks);
router.get("/submissions", taskController.getMyAllSubmissions);
router.get("/:id", taskController.getTaskById);

router.post("/submit/:task_id", taskController.submitTask);
router.get("/submission/:task_id", taskController.getMySubmission);
router.patch("/submission/:task_id", taskController.updateSubmission);

module.exports = router;
