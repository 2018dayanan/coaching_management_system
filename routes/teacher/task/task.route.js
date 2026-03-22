const express = require("express");
const router = express.Router();
const taskController = require("../../../controller/teacher/task/taskController");
const teacherMiddleware = require("../../../middlewares/teacherMiddleware");

// Ensure all sub-routes here use the teacher middleware logic
router.use(teacherMiddleware);

router.post("/", taskController.createTask);
router.get("/", taskController.getAllTasks);
router.get("/:id", taskController.getTaskById);
router.patch("/:id", taskController.updateTask);
router.delete("/:id", taskController.deleteTask);

module.exports = router;
