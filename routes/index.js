const express = require("express");
const router = express.Router();

const authRoutes = require("./auth/auth.routes");
const adminRoutes = require("./admin/admin.index");
const teacherRoutes = require("./teacher/teacher.index");
const userRoutes = require("./user/user.index");

const apiV1Router = express.Router();

apiV1Router.use("/auth", authRoutes);

apiV1Router.use("/admin", adminRoutes);
apiV1Router.use("/teacher", teacherRoutes);
apiV1Router.use("/user", userRoutes);

router.use("/api/v1", apiV1Router);

module.exports = router;