const express = require("express");
const router = express.Router();
const notificationController = require("../../controller/user/notification.controller");

router.get("/", notificationController.getMyNotifications);
router.patch("/read/:id", notificationController.markAsRead);
router.patch("/read-all", notificationController.markAllRead);

module.exports = router;
