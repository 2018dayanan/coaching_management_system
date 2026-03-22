const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },

    description: String,

    subject: String,

    batch_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Batch',
        required: true,
    },

    assigned_date: Date,
    due_date: Date,

    attachment_url: String,

    teacher_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }

}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);