const NotificationModel = require("../../models/notification_model");

// Fetch all notifications for the logged-in user
const getMyNotifications = async (req, res) => {
    try {
        const recipient_id = req.userInfo.id;

        const notifications = await NotificationModel.find({ recipient_id })
            .sort({ createdAt: -1 })
            .limit(50);

        res.status(200).json({
            status: true,
            message: "Notifications fetched successfully",
            data: notifications
        });
    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({ status: false, message: "Internal server error" });
    }
};

// Mark a specific notification as read
const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const recipient_id = req.userInfo.id;

        const notification = await NotificationModel.findOneAndUpdate(
            { _id: id, recipient_id },
            { is_read: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ status: false, message: "Notification not found or access denied" });
        }

        res.status(200).json({
            status: true,
            message: "Notification marked as read",
            data: notification
        });
    } catch (error) {
        console.error("Error marking notification as read:", error);
        res.status(500).json({ status: false, message: "Internal server error" });
    }
};

// Mark all notifications as read for the logged-in user
const markAllAsRead = async (req, res) => {
    try {
        const recipient_id = req.userInfo.id;

        await NotificationModel.updateMany(
            { recipient_id, is_read: false },
            { is_read: true }
        );

        res.status(200).json({
            status: true,
            message: "All notifications marked as read"
        });
    } catch (error) {
        console.error("Error marking all as read:", error);
        res.status(500).json({ status: false, message: "Internal server error" });
    }
};

module.exports = {
    getMyNotifications,
    markAsRead,
    markAllAsRead
};
