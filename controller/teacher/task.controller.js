const { Task, Batch, Enrollment } = require("../../models");
const { sendNotification } = require("../../services/notification_manager");
const catchAsync = require("../../utils/catchAsync");
const AppError = require("../../utils/appError");

// Create a new task
exports.createTask = catchAsync(async (req, res, next) => {
    const { title, description, subject, batch_id, assigned_date, due_date, attachment_url } = req.body;
    const teacher_id = req.user.userId;

    if (!title || !batch_id) {
        return next(new AppError("Title and batch_id are required.", 400));
    }

    const batch = await Batch.findById(batch_id);
    if (!batch) {
        return next(new AppError("Batch not found.", 404));
    }

    const newTask = await Task.create({
        title,
        description,
        subject,
        batch_id,
        assigned_date,
        due_date,
        attachment_url,
        teacher_id
    });

    const enrollments = await Enrollment.find({ batch_id, status: 'active' }).select('student_id');
    const student_ids = enrollments.map(e => e.student_id);

    if (student_ids.length > 0) {
        await sendNotification({
            recipients: student_ids,
            sender_id: teacher_id,
            title: "New Task Available",
            message: `Your teacher has assigned a new task: "${title}" for batch: ${batch.name}`,
            type: 'task',
            related_id: newTask._id
        });
    }

    res.status(201).json({
        status: true,
        message: "Task created successfully and students notified",
        data: newTask
    });
});

// Get all tasks for the logged-in teacher
exports.getAllTasks = catchAsync(async (req, res, next) => {
    const teacher_id = req.user.userId;
    const { batch_id } = req.query;

    let query = { teacher_id };
    if (batch_id) query.batch_id = batch_id;

    const tasks = await Task.find(query)
        .populate('batch_id', 'name subject status enrolled_students')
        .sort({ createdAt: -1 });

    res.status(200).json({
        status: true,
        message: "Tasks fetched successfully",
        data: tasks
    });
});

// Get a single task by ID
exports.getTaskById = catchAsync(async (req, res, next) => {
    const task = await Task.findById(req.params.id)
        .populate('batch_id', 'name subject status enrolled_students');

    if (!task) {
        return next(new AppError("Task not found", 404));
    }

    res.status(200).json({
        status: true,
        message: "Task fetched successfully",
        data: task
    });
});

// Update an existing task
exports.updateTask = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { title, description, subject, batch_id, assigned_date, due_date, attachment_url } = req.body;
    const teacher_id = req.user.userId;

    const task = await Task.findOne({ _id: id, teacher_id });
    if (!task) {
        return next(new AppError("Task not found or access denied", 404));
    }

    const updateData = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (subject) updateData.subject = subject;
    if (batch_id) updateData.batch_id = batch_id;
    if (assigned_date) updateData.assigned_date = assigned_date;
    if (due_date) updateData.due_date = due_date;
    if (attachment_url) updateData.attachment_url = attachment_url;

    const updatedTask = await Task.findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
        .populate('batch_id', 'name subject');

    res.status(200).json({
        status: true,
        message: "Task updated successfully",
        data: updatedTask
    });
});

// Delete a task entirely
exports.deleteTask = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const teacher_id = req.user.userId;

    const deletedTask = await Task.findOneAndDelete({ _id: id, teacher_id });
    if (!deletedTask) {
        return next(new AppError("Task not found or access denied", 404));
    }

    res.status(200).json({
        status: true,
        message: "Task permanently deleted successfully"
    });
});
