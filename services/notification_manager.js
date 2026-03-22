const NotificationModel = require("../models/notification_model");

/**
 * Sends a notification to one or more recipients.
 * @param {Array|string} recipient_ids
 * @param {string} sender_id 
 * @param {string} title 
 * @param {string} message
 * @param {string} type 
 * @param {string} related_id
 */
const sendNotification = async ({ recipients, sender_id, title, message, type = 'info', related_id = null }) => {
    try {
        if (!recipients || (Array.isArray(recipients) && recipients.length === 0)) {
            return;
        }

        const recipientList = Array.isArray(recipients) ? recipients : [recipients];

        const notifications = recipientList.map(recipient_id => ({
            recipient_id,
            sender_id,
            title,
            message,
            type,
            related_id
        }));

        await NotificationModel.insertMany(notifications);
    } catch (error) {
        console.error("Error creating notifications:", error);
    }
};

module.exports = {
    sendNotification
};
