const mongoose = require('mongoose');
const user_model = require('./user_model');

const studentSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },

    batch_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Batch',
        required: true,
    },

    join_date: Date,

    guardian_name: String,
    guardian_mobile: String,

}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);