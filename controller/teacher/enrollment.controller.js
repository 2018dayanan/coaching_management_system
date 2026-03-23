const { Enrollment, Batch, User } = require("../../models");
const { sendNotification } = require("../../services/notification_manager");
const catchAsync = require("../../utils/catchAsync");
const AppError = require("../../utils/appError");

// Enroll multiple students into a batch
exports.enrollStudents = catchAsync(async (req, res, next) => {
    const { batch_id, student_ids } = req.body;

    if (!batch_id) {
        return next(new AppError("batch_id is required.", 400));
    }

    if (!student_ids || !Array.isArray(student_ids) || student_ids.length === 0) {
        return next(new AppError("student_ids must be a non-empty array.", 400));
    }

    const batch = await Batch.findById(batch_id);
    if (!batch) {
        return next(new AppError("Batch not found.", 404));
    }

    const validStudents = await User.find({
        _id: { $in: student_ids },
        role: 'student',
        is_deleted: false
    });

    if (validStudents.length !== student_ids.length) {
        return next(new AppError("One or more student IDs are invalid, deleted, or do not belong to a student.", 400));
    }

    const enrollmentsToCreate = student_ids.map(student_id => ({
        batch_id,
        student_id,
        status: 'active'
    }));

    let insertedCount = 0;
    try {
        const result = await Enrollment.insertMany(enrollmentsToCreate, { ordered: false });
        insertedCount = result.length;
    } catch (insertError) {
        if (insertError.code === 11000 || insertError.writeErrors) {
            insertedCount = insertError.insertedDocs ? insertError.insertedDocs.length : 0;
        } else {
            throw insertError; 
        }
    }

    if (insertedCount > 0) {
        await sendNotification({
            recipients: student_ids,
            sender_id: req.user.userId,
            title: "New Enrollment",
            message: `You have been successfully enrolled in the batch: ${batch.name}`,
            type: 'info',
            related_id: batch._id
        });
    }

    res.status(201).json({
        status: true,
        message: `Successfully enrolled ${insertedCount} new student(s).`,
        already_enrolled_count: student_ids.length - insertedCount
    });
});

// Fetch all active students enrolled in a specific batch
exports.getStudentsByBatchId = catchAsync(async (req, res, next) => {
    const { batch_id } = req.params;

    const enrollments = await Enrollment.find({ batch_id, status: 'active' })
        .populate('student_id', 'name email mobile unique_id profile_picture gender')
        .sort({ enrollment_date: -1 });

    const students = enrollments.map(enrollment => {
        if (!enrollment.student_id) return null; 

        return {
            enrollment_id: enrollment._id,
            enrollment_date: enrollment.enrollment_date,
            status: enrollment.status,
            ...enrollment.student_id._doc
        };
    }).filter(item => item !== null);

    res.status(200).json({
        status: true,
        message: "Students fetched successfully",
        data: students
    });
});
