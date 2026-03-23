const express = require("express");
const router = express.Router();
const userController = require("../../../controller/admin/user.controller");

router.post("/", userController.createUser);
router.get("/", userController.getAllUsers);
router.get("/:id", userController.getUserById);
router.patch("/:id", userController.updateUser);
router.patch("/status/:id", userController.updateUserStatus);
router.delete("/:id", userController.deleteUser);

module.exports = router;
