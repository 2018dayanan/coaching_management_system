const { Task, Enrollment, Submission } = require("../../models");
const cloudinary = require("../../config/cloudinary");
const catchAsync = require("../../utils/catchAsync");
const AppError = require("../../utils/appError");

exports.getMyTasks = catchAsync(async (req, res, next) => {
    const student_id = req.user.userId;

    const enrollments = await Enrollment.find({ student_id, status: 'active' }).select('batch_id');
    const batchIds = enrollments.map(e => e.batch_id);

    if (batchIds.length === 0) {
        return res.status(200).json({
            status: true,
            message: "No tasks found (not enrolled in any batch)",
            data: []
        });
    }

    const tasks = await Task.find({ batch_id: { $in: batchIds } })
        .populate('batch_id', 'name subject description')
        .populate('teacher_id', 'name profile_picture email')
        .sort({ createdAt: -1 });

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

// Submit a task (student submits answer to a teacher's task)
exports.submitTask = catchAsync(async (req, res, next) => {
    const student_id = req.user.userId;
    const { task_id } = req.params;
    const { submission_text, content_html } = req.body;

    const task = await Task.findById(task_id);
    if (!task) {
        return next(new AppError("Task not found", 404));
    }

    const isEnrolled = await Enrollment.findOne({
        student_id,
        batch_id: task.batch_id,
        status: 'active'
    });
    if (!isEnrolled) {
        return next(new AppError("Access denied. You are not enrolled in this batch.", 403));
    }

    const existing = await Submission.findOne({ task_id, student_id });
    if (existing) {
        return next(new AppError("You have already submitted this task. Use the update endpoint to re-submit.", 400));
    }

    const file_urls = [];
    if (req.files && req.files.attachments) {
        const files = Array.isArray(req.files.attachments)
            ? req.files.attachments
            : [req.files.attachments];

        for (const file of files) {
            const base64 = `data:${file.mimetype};base64,${file.data.toString('base64')}`;
            const result = await cloudinary.uploader.upload(base64, {
                folder: `task_submissions/${task_id}/${student_id}`,
                resource_type: 'auto',
                public_id: `submission_${Date.now()}`
            });
            file_urls.push(result.secure_url);
        }
    }

    const submission = await Submission.create({
        task_id,
        student_id,
        submission_text,
        content_html: content_html || '',
        file_urls
    });

    res.status(201).json({
        status: true,
        message: "Task submitted successfully",
        data: submission
    });
});

exports.getMySubmission = catchAsync(async (req, res, next) => {
    const student_id = req.user.userId;
    const { task_id } = req.params;

    const submission = await Submission.findOne({ task_id, student_id })
        .populate('task_id', 'title subject due_date batch_id');

    if (!submission) {
        return res.status(200).json({
            status: true,
            message: "No submission found for this task",
            data: null
        });
    }

    res.status(200).json({
        status: true,
        message: "Submission fetched successfully",
        data: submission
    });
});

// Update (re-submit) a task — only allowed if not yet reviewed
exports.updateSubmission = catchAsync(async (req, res, next) => {
    const student_id = req.user.userId;
    const { task_id } = req.params;
    const { submission_text, content_html } = req.body;

    const submission = await Submission.findOne({ task_id, student_id });
    if (!submission) {
        return next(new AppError("No submission found to update. Please submit first.", 404));
    }

    if (submission.review_status === 'reviewed') {
        return next(new AppError("Cannot update a submission that has already been reviewed.", 400));
    }

    if (submission_text) submission.submission_text = submission_text;
    if (content_html) submission.content_html = content_html;
    submission.submitted_at = Date.now();

    // Handle new file uploads
    if (req.files && req.files.attachments) {
        const files = Array.isArray(req.files.attachments)
            ? req.files.attachments
            : [req.files.attachments];

        const file_urls = [];
        for (const file of files) {
            const base64 = `data:${file.mimetype};base64,${file.data.toString('base64')}`;
            const result = await cloudinary.uploader.upload(base64, {
                folder: `task_submissions/${task_id}/${student_id}`,
                resource_type: 'auto',
                public_id: `submission_${Date.now()}`
            });
            file_urls.push(result.secure_url);
        }
        submission.file_urls = file_urls;
    }

    await submission.save();

    res.status(200).json({
        status: true,
        message: "Submission updated successfully",
        data: submission
    });
});

// Get ALL my submissions (all tasks I have submitted)
exports.getMyAllSubmissions = catchAsync(async (req, res, next) => {
    const student_id = req.user.userId;

    const submissions = await Submission.find({ student_id })
        .populate({
            path: 'task_id',
            select: 'title subject due_date assigned_date batch_id teacher_id',
            populate: [
                { path: 'batch_id', select: 'name subject' },
                { path: 'teacher_id', select: 'name profile_picture' }
            ]
        })
        .sort({ submitted_at: -1 });

    // Summarize each submission
    const data = submissions.map(sub => ({
        submission_id: sub._id,
        submitted_at: sub.submitted_at,
        review_status: sub.review_status,
        marks: sub.marks || null,
        remark: sub.remark || null,
        task: sub.task_id
    }));

    res.status(200).json({
        status: true,
        message: "All submissions fetched successfully",
        total: data.length,
        data
    });
});
