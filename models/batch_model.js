const mongoose = require('mongoose');

const batchSchema = new mongoose.Schema({
    name: { type: String, required: true },
    subject: String,

    description: String,

    teacher_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },

    start_date: Date,
    end_date: Date,

    enrolled_students: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],

    status: {
        type: String,
        enum: ['active', 'completed'],
        default: 'active',
    }

}, { timestamps: true });

module.exports = mongoose.model('Batch', batchSchema);