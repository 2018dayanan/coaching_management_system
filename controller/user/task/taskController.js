const TaskModel = require("../../../models/task_model");
const EnrollmentModel = require("../../../models/enrollment_model");

// Fetch all tasks assigned to the batches a student is enrolled in
const getMyTasks = async (req, res) => {
    try {
        const student_id = req.userInfo.userId;

        // 1. Find all batches the student is enrolled in
        const enrollments = await EnrollmentModel.find({ student_id, status: 'active' }).select('batch_id');
        const batchIds = enrollments.map(e => e.batch_id);

        if (batchIds.length === 0) {
            return res.status(200).json({
                status: true,
                message: "No tasks found (not enrolled in any batch)",
                data: []
            });
        }

        // 2. Find all tasks for those batches
        const tasks = await TaskModel.find({ batch_id: { $in: batchIds } })
            .populate('batch_id', 'name subject description')
            .populate('teacher_id', 'name profile_picture email')
            .sort({ createdAt: -1 });

        // Clean up response if needed (e.g. rename teacher stuff)
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
    } catch (error) {
        console.error("Error fetching student tasks:", error);
        res.status(500).json({ status: false, message: "Internal server error" });
    }
};

// Get a single task detail for a student
const getTaskById = async (req, res) => {
    try {
        const { id } = req.params;
        const student_id = req.userInfo.userId;

        // Verify student has access to this task's batch
        const task = await TaskModel.findById(id)
            .populate('batch_id', 'name subject description')
            .populate('teacher_id', 'name profile_picture email');

        if (!task) {
            return res.status(404).json({ status: false, message: "Task not found" });
        }

        const isEnrolled = await EnrollmentModel.findOne({
            student_id,
            batch_id: task.batch_id._id,
            status: 'active'
        });

        if (!isEnrolled) {
            return res.status(403).json({ status: false, message: "Access denied. You are not enrolled in this batch." });
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
    } catch (error) {
        console.error("Error fetching student task detail:", error);
        res.status(500).json({ status: false, message: "Internal server error" });
    }
};

module.exports = {
    getMyTasks,
    getTaskById
};
