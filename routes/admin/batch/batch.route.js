const express = require("express");
const router = express.Router();
// Assuming you have an adminAuthMiddleware to protect these routes.
// const adminMiddleware = require("../../../middlewares/adminMiddleware");
const batchController = require("../../../controller/adminController/batchController/batchcontroller");

router.post("/", batchController.createBatch);
router.get("/", batchController.getAllBatches);
router.get("/:id", batchController.getBatchById);
router.patch("/:id", batchController.updateBatch);
router.delete("/:id", batchController.deleteBatch);

module.exports = router;
