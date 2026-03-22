const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
    task_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task',
        required: true,
    },

    student_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },

    submission_text: String,
    file_url: String,

    submitted_at: {
        type: Date,
        default: Date.now,
    },

    review_status: {
        type: String,
        enum: ['pending', 'reviewed'],
        default: 'pending',
    },

    marks: String,
    remark: String,

    reviewed_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }

}, { timestamps: true });

module.exports = mongoose.model('Submission', submissionSchema);