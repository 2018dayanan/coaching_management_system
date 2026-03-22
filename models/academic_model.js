const mongoose = require('mongoose');

const AcademicSchema = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },

        educationLevel: {
            type: String,
            required: true,
            enum: [
                'school',
                'high_school',
                'diploma',
                'bachelor',
                'master',
                'phd',
                'other',
            ],
            lowercase: true,
            trim: true,
        },

        schoolOrCollege: {
            type: String,
            required: true,
            trim: true,
        },

        batchId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Batch',
            required: false,
            index: true,
        },

        enrolledCourseIds: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Course',
            },
        ],

        startYear: {
            type: Number,
        },

        endYear: {
            type: Number,
        },

        isCurrentlyStudying: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Academic', AcademicSchema);