const express = require("express");
const router = express.Router();

const authRoutes = require("./auth/auth.routes");
const userRoutes = require("./user/user.routes");
const adminAuthRoutes = require("./admin/auth/auth.routes");
const adminUserRoutes = require("./admin/user/user.route");
const adminBatchRoutes = require("./admin/batch/batch.route");
const adminClassRoutes = require("./admin/class/class.route");
const adminRouter = express.Router();
const apiV1Router = express.Router();

apiV1Router.use("/auth", authRoutes);
apiV1Router.use("/user", userRoutes);

adminRouter.use("/auth", adminAuthRoutes);
adminRouter.use("/users", adminUserRoutes);
adminRouter.use("/batches", adminBatchRoutes);
adminRouter.use("/classes", adminClassRoutes);

apiV1Router.use("/admin", adminRouter);

router.use("/api/v1", apiV1Router);

module.exports = router;