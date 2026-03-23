const { User, Batch, ClassModel, Enrollment, Task } = require("../../models");
const catchAsync = require("../../utils/catchAsync");

exports.getDashboardStats = catchAsync(async (req, res, next) => {
    const [
        totalStudents,
        totalTeachers,
        totalBatches,
        totalClasses,
        totalEnrollments,
        totalTasks,
        activeBatches
    ] = await Promise.all([
        User.countDocuments({ role: 'student', is_deleted: false }),
        User.countDocuments({ role: 'teacher', is_deleted: false }),
        Batch.countDocuments(),
        ClassModel.countDocuments(),
        Enrollment.countDocuments({ status: 'active' }),
        Task.countDocuments(),
        Batch.countDocuments({ status: 'active' })
    ]);

    res.status(200).json({
        status: true,
        message: "Dashboard stats fetched successfully",
        data: {
            total_students: totalStudents,
            total_teachers: totalTeachers,
            total_batches: totalBatches,
            active_batches: activeBatches,
            total_classes: totalClasses,
            total_active_enrollments: totalEnrollments,
            total_tasks: totalTasks
        }
    });
});
