const express = require("express");
const router = express.Router();

const authRoutes = require("./auth/auth.routes");
const userRoutes = require("./user/user.routes");
const adminAuthRoutes = require("./admin/auth/auth.routes");
const adminUserRoutes = require("./admin/user/user.route");

const apiV1Router = express.Router();

apiV1Router.use("/auth", authRoutes);
apiV1Router.use("/user", userRoutes);
apiV1Router.use("/admin/auth", adminAuthRoutes);
apiV1Router.use("/admin/users", adminUserRoutes);

router.use("/api/v1", apiV1Router);

module.exports = router;