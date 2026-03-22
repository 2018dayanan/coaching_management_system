const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipient_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sender_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['task', 'class', 'grade', 'info'],
        default: 'info'
    },
    related_id: {
        type: mongoose.Schema.Types.ObjectId
    },
    is_read: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

notificationSchema.index({ recipient_id: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
