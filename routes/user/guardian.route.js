const express = require("express");
const router = express.Router();
const guardianController = require("../../controller/user/guardian/guardianController");
const authMiddleware = require("../../middlewares/authMiddleware");

// Authentication required for all guardian routes
router.use(authMiddleware);

router.post("/", guardianController.createGuardian);
router.get("/", guardianController.getMyGuardians);
router.get("/:id", guardianController.getGuardianById);
router.patch("/:id", guardianController.updateGuardian);
router.delete("/:id", guardianController.deleteGuardian);

module.exports = router;
