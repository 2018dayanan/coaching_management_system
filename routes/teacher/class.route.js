const express = require("express");
const router = express.Router();
const classController = require("../../controller/teacher/class.controller");

router.post("/", classController.createClass);
router.get("/", classController.getMyClasses);
router.get("/:id", classController.getClassById);
router.patch("/:id", classController.updateClass);
router.delete("/:id", classController.deleteClass);

module.exports = router;
