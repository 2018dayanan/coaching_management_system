const mongoose = require('mongoose');

const GuardianSchema = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },

        guardianName: {
            type: String,
            required: true,
            trim: true,
        },

        guardianPhone: {
            type: String,
            required: true,
            trim: true,
        },

        guardianRelationship: {
            type: String,
            required: true,
            enum: [
                'father',
                'mother',
                'brother',
                'sister',
                'uncle',
                'aunt',
                'guardian',
                'other',
            ],
            lowercase: true,
            trim: true,
        },

        isPrimary: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Guardian', GuardianSchema);