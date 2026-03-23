const express = require("express");
const router = express.Router();
const classController = require("../../../controller/admin/class.controller");

router.post("/", classController.createClass);
router.get("/", classController.getAllClasses);
router.get("/:id", classController.getClassById);
router.patch("/:id", classController.updateClass);
router.delete("/:id", classController.deleteClass);
router.get("/teacher/:teacher_id", classController.getClassesByTeacherId);

module.exports = router;
