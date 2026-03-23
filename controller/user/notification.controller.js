const { Notification } = require("../../models");
const catchAsync = require("../../utils/catchAsync");
const AppError = require("../../utils/appError");

// Get all notifications for the logged-in user
exports.getMyNotifications = catchAsync(async (req, res, next) => {
    const user_id = req.user.userId;

    const notifications = await Notification.find({ recipient_id: user_id })
        .sort({ createdAt: -1 })
        .limit(50); // Limit to last 50 for performance

    res.status(200).json({
        status: true,
        message: "Notifications fetched successfully",
        data: notifications
    });
});

// Mark a single notification as read
exports.markAsRead = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const user_id = req.user.userId;

    const notification = await Notification.findOneAndUpdate(
        { _id: id, recipient_id: user_id },
        { is_read: true },
        { new: true }
    );

    if (!notification) {
        return next(new AppError("Notification not found or access denied", 404));
    }

    res.status(200).json({
        status: true,
        message: "Notification marked as read",
        data: notification
    });
});

// Mark all as read
exports.markAllRead = catchAsync(async (req, res, next) => {
    const user_id = req.user.userId;

    await Notification.updateMany(
        { recipient_id: user_id, is_read: false },
        { is_read: true }
    );

    res.status(200).json({
        status: true,
        message: "All notifications marked as read"
    });
});
