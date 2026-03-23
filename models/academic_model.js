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
                'school', 'high_school',
                'diploma', 'bachelor', 'master', 'phd', 'other'
            ],
            lowercase: true,
            trim: true,
        },

        degreeName: {
            type: String,
            trim: true,
        },

        boardOrUniversity: {
            type: String,
            trim: true,
        },

        location: {
            type: String,
            trim: true,
        },

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

        percentage: {
            type: Number,
            min: 0,
            max: 100,
        },

        cgpa: {
            type: Number,
            min: 0,
            max: 10,
        },

        grade: {
            type: String,
            trim: true,
            enum: ['a+', 'a', 'a-', 'b+', 'b', 'b-', 'c+', 'c', 'd', 'f'],
            lowercase: true,
        },

        description: {
            type: String,
            maxlength: 400,
            trim: true,
        },
        documents: {
            type: [String],
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Academic', AcademicSchema);