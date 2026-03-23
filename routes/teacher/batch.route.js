const express = require("express");
const router = express.Router();
const batchController = require("../../controller/teacher/batch.controller");

router.get("/", batchController.getMyBatches);

module.exports = router;
