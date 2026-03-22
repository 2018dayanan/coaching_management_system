const express = require("express");
const router = express.Router();
const classController = require("../../../controller/adminController/classController/classcontroller");
const adminMiddleware = require("../../../middlewares/adminMiddleware");

router.use(adminMiddleware);

router.post("/", classController.createClass);
router.get("/", classController.getAllClasses);
router.get("/teacher/:teacher_id", classController.getClassesByTeacherId);
router.get("/:id", classController.getClassById);
router.patch("/:id", classController.updateClass);
router.delete("/:id", classController.deleteClass);

module.exports = router;
