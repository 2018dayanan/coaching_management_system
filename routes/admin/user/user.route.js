const express = require("express");
const router = express.Router();
const userController = require("../../../controller/adminController/userController/usercontroller");
const adminMiddleware = require("../../../middlewares/adminMiddleware");

router.use(adminMiddleware);

router.get("/", userController.getAllUsers);
router.post("/", userController.createUser);
router.get("/:id", userController.getUserById);
router.patch("/:id", userController.updateUser);
router.patch("/status/:id", userController.updateUserStatus);
router.delete("/:id", userController.deleteUser);

module.exports = router;
