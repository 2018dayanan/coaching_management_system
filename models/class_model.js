const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
    title: { type: String, required: true },

    subject: String,

    batch_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Batch',
        required: true,
    },

    class_date: { type: Date, required: true },

    class_time: { type: String, required: true },

    meeting_link: String,

    teacher_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },

    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }

}, { timestamps: true });

module.exports = mongoose.model('Class', classSchema);