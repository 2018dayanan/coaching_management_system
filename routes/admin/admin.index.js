const express = require('express');
const router = express.Router();

const { protect, restrictTo } = require('../../middlewares/auth.middleware');

const userManagementRoutes = require('./user/user.route');
const batchManagementRoutes = require('./batch/batch.route');
const classManagementRoutes = require('./class/class.route');
const authRoutes = require('./auth/auth.routes');

router.use('/auth', authRoutes);

router.use(protect);
router.use(restrictTo('SUPER_ADMIN'));

router.use('/users', userManagementRoutes);
router.use('/batches', batchManagementRoutes);
router.use('/classes', classManagementRoutes);

module.exports = router;
