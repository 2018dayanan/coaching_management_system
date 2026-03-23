const { Task, Enrollment } = require("../../models");
const catchAsync = require("../../utils/catchAsync");
const AppError = require("../../utils/appError");

// Fetch all tasks assigned to the batches a student is enrolled in
exports.getMyTasks = catchAsync(async (req, res, next) => {
    const student_id = req.user.userId;

    // 1. Find all batches the student is enrolled in
    const enrollments = await Enrollment.find({ student_id, status: 'active' }).select('batch_id');
    const batchIds = enrollments.map(e => e.batch_id);

    if (batchIds.length === 0) {
        return res.status(200).json({
            status: true,
            message: "No tasks found (not enrolled in any batch)",
            data: []
        });
    }

    // 2. Find all tasks for those batches
    const tasks = await Task.find({ batch_id: { $in: batchIds } })
        .populate('batch_id', 'name subject description')
        .populate('teacher_id', 'name profile_picture email')
        .sort({ createdAt: -1 });

    // Clean up response
    const formattedTasks = tasks.map(task => {
        const taskObj = task.toObject();
        const teacherDetail = taskObj.teacher_id;
        delete taskObj.teacher_id;

        return {
            ...taskObj,
            teacherDetail: teacherDetail || null
        };
    });

    res.status(200).json({
        status: true,
        message: "Tasks fetched successfully",
        data: formattedTasks
    });
});

// Get a single task detail for a student
exports.getTaskById = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const student_id = req.user.userId;

    // Verify student has access to this task's batch
    const task = await Task.findById(id)
        .populate('batch_id', 'name subject description')
        .populate('teacher_id', 'name profile_picture email');

    if (!task) {
        return next(new AppError("Task not found", 404));
    }

    const isEnrolled = await Enrollment.findOne({
        student_id,
        batch_id: task.batch_id._id,
        status: 'active'
    });

    if (!isEnrolled) {
        return next(new AppError("Access denied. You are not enrolled in this batch.", 403));
    }

    const taskObj = task.toObject();
    const teacherDetail = taskObj.teacher_id;
    delete taskObj.teacher_id;

    res.status(200).json({
        status: true,
        message: "Task detail fetched successfully",
        data: {
            ...taskObj,
            teacherDetail: teacherDetail || null
        }
    });
});
