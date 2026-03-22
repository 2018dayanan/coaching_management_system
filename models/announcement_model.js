const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
    title: { type: String, required: true },

    message: { type: String, required: true },

    batch_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Batch',
        default: null,
    },

    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }

}, { timestamps: true });

module.exports = mongoose.model('Announcement', announcementSchema);