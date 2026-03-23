const express = require("express");
const router = express.Router();
const taskController = require("../../controller/user/task/taskController");
const authMiddleware = require("../../middlewares/authMiddleware");

// Student authentication required
router.use(authMiddleware);

router.get("/", taskController.getMyTasks);
router.get("/:id", taskController.getTaskById);

module.exports = router;
