const { Batch, ClassModel, Task, Submission, Enrollment } = require("../../models");
const catchAsync = require("../../utils/catchAsync");

exports.getTeacherStats = catchAsync(async (req, res, next) => {
    const teacher_id = req.user.userId;

    // 1. Total Batches
    const totalBatches = await Batch.countDocuments({ teacher_id });

    // 2. Total Classes
    const totalClasses = await ClassModel.countDocuments({ teacher_id });

    // 3. Total Tasks
    const totalTasks = await Task.countDocuments({ teacher_id });

    // 4. Total Unique Students
    // First, find all batches belonging to this teacher
    const batches = await Batch.find({ teacher_id }).select('_id');
    const batch_ids = batches.map(b => b._id);

    // Then, count unique students in those batches
    const uniqueStudents = await Enrollment.distinct('student_id', { 
        batch_id: { $in: batch_ids },
        status: 'active'
    });
    const totalStudents = uniqueStudents.length;

    // 5. Pending Submissions
    // Get all task IDs for this teacher
    const tasks = await Task.find({ teacher_id }).select('_id');
    const task_ids = tasks.map(t => t._id);

    // Count submissions with status 'pending' for those tasks
    const pendingSubmissions = await Submission.countDocuments({
        task_id: { $in: task_ids },
        review_status: 'pending'
    });

    // 6. Recent/Upcoming Classes (next 5)
    const upcomingClasses = await ClassModel.find({ teacher_id })
        .populate('batch_id', 'name subject')
        .sort({ class_date: 1, class_time: 1 })
        .limit(5);

    // 7. Recent Tasks (latest 5)
    const recentTasks = await Task.find({ teacher_id })
        .populate('batch_id', 'name')
        .sort({ createdAt: -1 })
        .limit(5);

    res.status(200).json({
        status: true,
        message: "Teacher statistics fetched successfully",
        data: {
            stats: {
                totalBatches,
                totalClasses,
                totalTasks,
                totalStudents,
                pendingSubmissions
            },
            upcomingClasses,
            recentTasks
        }
    });
});
