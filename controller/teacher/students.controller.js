const { Enrollment, Batch, Task, Submission } = require("../../models");
const catchAsync = require("../../utils/catchAsync");
const AppError = require("../../utils/appError");

exports.getMyStudents = catchAsync(async (req, res, next) => {
    const teacher_id = req.user.userId;

    const batches = await Batch.find({ teacher_id });
    if (!batches.length) {
        return res.status(200).json({ status: true, message: "No batches found for this teacher", data: [] });
    }

    const batch_ids = batches.map(b => b._id);

    const enrollments = await Enrollment.find({ batch_id: { $in: batch_ids }, status: 'active' })
        .populate('student_id', 'name unique_id profile_picture')
        .populate('batch_id', 'name subject status');

    const studentMap = new Map();

    for (const enrollment of enrollments) {
        if (!enrollment.student_id) continue;

        const student = enrollment.student_id;
        const studentId = student._id.toString();

        if (!studentMap.has(studentId)) {
            studentMap.set(studentId, {
                _id: student._id,
                name: student.name,
                unique_id: student.unique_id,
                profile_picture: student.profile_picture,
                enrolled_batches: []
            });
        }

        studentMap.get(studentId).enrolled_batches.push({
            enrollment_id: enrollment._id,
            enrollment_date: enrollment.enrollment_date,
            status: enrollment.status,
            batch: enrollment.batch_id
        });
    }

    const students = Array.from(studentMap.values());

    res.status(200).json({
        status: true,
        message: "Students fetched successfully",
        total: students.length,
        data: students
    });
});

exports.getStudentDetail = catchAsync(async (req, res, next) => {
    const teacher_id = req.user.userId;
    const { student_id } = req.params;

    const batches = await Batch.find({ teacher_id });
    const batch_ids = batches.map(b => b._id);

    const enrollments = await Enrollment.find({
        student_id,
        batch_id: { $in: batch_ids },
        status: 'active'
    })
        .populate('student_id', 'name unique_id profile_picture')
        .populate('batch_id', 'name subject status start_date end_date');

    if (!enrollments.length) {
        return next(new AppError("Student not found in your batches", 404));
    }

    const studentBatchIds = enrollments.map(e => e.batch_id._id);
    const tasks = await Task.find({
        teacher_id,
        batch_id: { $in: studentBatchIds }
    }).select('title subject batch_id due_date assigned_date');

    const task_ids = tasks.map(t => t._id);
    const submissions = await Submission.find({
        student_id,
        task_id: { $in: task_ids }
    }).populate('task_id', 'title subject due_date batch_id');

    const submissionMap = new Map(
        submissions.map(s => [s.task_id._id.toString(), s])
    );

    const tasksWithStatus = tasks.map(task => {
        const submission = submissionMap.get(task._id.toString());
        return {
            task_id: task._id,
            title: task.title,
            subject: task.subject,
            batch_id: task.batch_id,
            due_date: task.due_date,
            assigned_date: task.assigned_date,
            submission: submission
                ? {
                    submission_id: submission._id,
                    submitted_at: submission.submitted_at,
                    submission_text: submission.submission_text,
                    file_url: submission.file_url,
                    review_status: submission.review_status,
                    marks: submission.marks,
                    remark: submission.remark
                }
                : null,
            is_submitted: !!submission
        };
    });

    res.status(200).json({
        status: true,
        message: "Student detail fetched successfully",
        data: {
            student: enrollments[0].student_id,
            enrolled_batches: enrollments.map(e => e.batch_id),
            tasks_summary: {
                total: tasks.length,
                submitted: submissions.length,
                pending: tasks.length - submissions.length
            },
            tasks: tasksWithStatus
        }
    });
});

exports.getTaskSubmissions = catchAsync(async (req, res, next) => {
    const teacher_id = req.user.userId;
    const { task_id, batch_id } = req.query;

    let taskQuery = { teacher_id };
    if (batch_id) taskQuery.batch_id = batch_id;
    if (task_id) taskQuery._id = task_id;

    const tasks = await Task.find(taskQuery).select('_id');
    const task_ids = tasks.map(t => t._id);

    const submissions = await Submission.find({ task_id: { $in: task_ids } })
        .populate('student_id', 'name unique_id profile_picture')
        .populate('task_id', 'title subject due_date batch_id')
        .sort({ submitted_at: -1 });

    res.status(200).json({
        status: true,
        message: "Submissions fetched successfully",
        total: submissions.length,
        data: submissions
    });
});

exports.reviewSubmission = catchAsync(async (req, res, next) => {
    const { submission_id } = req.params;
    const { marks, remark } = req.body;
    const teacher_id = req.user.userId;

    const submission = await Submission.findById(submission_id)
        .populate('task_id', 'teacher_id title');

    if (!submission) {
        return next(new AppError("Submission not found", 404));
    }

    if (submission.task_id.teacher_id.toString() !== teacher_id) {
        return next(new AppError("You are not authorized to review this submission", 403));
    }

    submission.marks = marks;
    submission.remark = remark;
    submission.review_status = 'reviewed';
    submission.reviewed_by = teacher_id;
    await submission.save();

    res.status(200).json({
        status: true,
        message: "Submission reviewed successfully",
        data: submission
    });
});
