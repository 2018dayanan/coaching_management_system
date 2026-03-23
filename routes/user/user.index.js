const express = require('express');
const router = express.Router();

const { protect } = require('../../middlewares/auth.middleware');

const courseRoutes = require('./course.route');
const taskRoutes = require('./task.route');
const academicRoutes = require('./academic.route');
const guardianRoutes = require('./guardian.route');
const notificationRoutes = require('./notification.route');
const profileRoutes = require('./profile.route');

router.use(protect);

router.use('/courses', courseRoutes);
router.use('/tasks', taskRoutes);
router.use('/academic', academicRoutes);
router.use('/guardian', guardianRoutes);
router.use('/notifications', notificationRoutes);
router.use('/', profileRoutes);

module.exports = router;
