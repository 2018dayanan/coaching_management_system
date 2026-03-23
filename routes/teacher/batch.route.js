const express = require("express");
const router = express.Router();
const batchController = require("../../controller/teacher/batch.controller");

router.post("/", batchController.createBatch);
router.get("/", batchController.getMyBatches);
router.get("/:id", batchController.getBatchById);
router.patch("/:id", batchController.updateBatch);
router.delete("/:id", batchController.deleteBatch);

module.exports = router;
