const express = require("express");
const router = express.Router();
const academicController = require("../../controller/user/academic.controller");

router.post("/", academicController.createAcademicDetail);
router.get("/", academicController.getMyAcademicDetails);
router.get("/:id", academicController.getAcademicDetailById);
router.patch("/:id", academicController.updateAcademicDetail);
router.delete("/:id", academicController.deleteAcademicDetail);

module.exports = router;
