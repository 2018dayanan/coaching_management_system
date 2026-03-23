const express = require("express");
const router = express.Router();
const taskController = require("../../controller/user/task.controller");

router.get("/", taskController.getMyTasks);
router.get("/:id", taskController.getTaskById);

module.exports = router;
