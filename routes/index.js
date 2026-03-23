const express = require("express");
const router = express.Router();

const authRoutes = require("./auth/auth.routes");
const userRoutes = require("./user/user.routes");
const adminAuthRoutes = require("./admin/auth/auth.routes");
const adminUserRoutes = require("./admin/user/user.route");
const adminBatchRoutes = require("./admin/batch/batch.route");
const adminClassRoutes = require("./admin/class/class.route");
const teacherEnrollRoutes = require("./teacher/enroll.route");
const teacherTaskRoutes = require("./teacher/task/task.route");
const notificationRoutes = require("./user/notification.route");
const userCourseRoutes = require("./user/course.route");
const userTaskRoutes = require("./user/task.route");
const adminRouter = express.Router();
const apiV1Router = express.Router();

apiV1Router.use("/auth", authRoutes);
apiV1Router.use("/user", userRoutes);

adminRouter.use("/auth", adminAuthRoutes);
adminRouter.use("/users", adminUserRoutes);
adminRouter.use("/batches", adminBatchRoutes);
adminRouter.use("/classes", adminClassRoutes);

apiV1Router.use("/admin", adminRouter);
apiV1Router.use("/teacher", teacherEnrollRoutes);
apiV1Router.use("/teacher/tasks", teacherTaskRoutes);
apiV1Router.use("/notifications", notificationRoutes);
apiV1Router.use("/user/courses", userCourseRoutes);
apiV1Router.use("/user/tasks", userTaskRoutes);

router.use("/api/v1", apiV1Router);

module.exports = router;