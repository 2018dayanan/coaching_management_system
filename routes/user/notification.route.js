const express = require("express");
const router = express.Router();
const notificationController = require("../../controller/user/notificationController");
const authMiddleware = require("../../middlewares/authMiddleware");

router.use(authMiddleware);

router.get("/", notificationController.getMyNotifications);
router.patch("/read-all", notificationController.markAllAsRead);
router.patch("/read/:id", notificationController.markAsRead);

module.exports = router;
