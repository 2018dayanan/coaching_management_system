const express = require("express");
const router = express.Router();
const batchController = require("../../../controller/adminController/batchController/batchcontroller");
const adminMiddleware = require("../../../middlewares/adminMiddleware");

router.use(adminMiddleware);

router.post("/", batchController.createBatch);
router.get("/", batchController.getAllBatches);
router.get("/:id", batchController.getBatchById);
router.patch("/:id", batchController.updateBatch);  
router.delete("/:id", batchController.deleteBatch);

module.exports = router;
