const express = require('express');
const router = express.Router();

const { protect, restrictTo } = require('../../middlewares/auth.middleware');

const enrollRoutes = require('./enroll.route');
const taskRoutes = require('./task.route');
const studentRoutes = require('./students.route');

router.use(protect);
router.use(restrictTo('teacher'));

router.use('/enroll', enrollRoutes);
router.use('/tasks', taskRoutes);
router.use('/students', studentRoutes);

module.exports = router;
