const express = require("express");
const router = express.Router();

const authRoutes = require("./auth/auth.routes");
const userRoutes = require("./user/user.routes");
const adminRoutes = require("./admin/auth/auth.routes");

const apiV1Router = express.Router();

apiV1Router.use("/auth", authRoutes);
apiV1Router.use("/user", userRoutes);
apiV1Router.use("/admin", adminRoutes);

router.use("/api/v1", apiV1Router);

module.exports = router;