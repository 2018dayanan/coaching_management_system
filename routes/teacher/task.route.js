const express = require("express");
const router = express.Router();
const taskController = require("../../controller/teacher/task.controller");

router.post("/", taskController.createTask);
router.get("/", taskController.getAllTasks);
router.get("/:id", taskController.getTaskById);
router.patch("/:id", taskController.updateTask);
router.delete("/:id", taskController.deleteTask);

module.exports = router;
