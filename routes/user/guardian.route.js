const express = require("express");
const router = express.Router();
const guardianController = require("../../controller/user/guardian.controller");

router.post("/", guardianController.createGuardian);
router.get("/", guardianController.getMyGuardians);
router.get("/:id", guardianController.getGuardianById);
router.patch("/:id", guardianController.updateGuardian);
router.delete("/:id", guardianController.deleteGuardian);

module.exports = router;
