const { ClassModel, Batch, Enrollment } = require("../../models");
const catchAsync = require("../../utils/catchAsync");
const AppError = require("../../utils/appError");

// Create a new class
exports.createClass = catchAsync(async (req, res, next) => {
    const { title, subject, batch_id, class_date, class_time, meeting_link } = req.body;
    const teacher_id = req.user.userId;

    // Verify batch existence and ownership
    if (batch_id) {
        const batch = await Batch.findOne({ _id: batch_id, teacher_id });
        if (!batch) {
            return next(new AppError("Associated batch not found or access denied.", 404));
        }
    }

    const newClass = await ClassModel.create({
        title,
        subject,
        batch_id,
        class_date,
        class_time,
        meeting_link,
        teacher_id,
        created_by: teacher_id
    });

    res.status(201).json({
        status: true,
        message: "Class created successfully",
        data: newClass
    });
});

// Get all classes for the logged-in teacher
exports.getMyClasses = catchAsync(async (req, res, next) => {
    const teacher_id = req.user.userId;
    const { batch_id } = req.query;

    let query = { teacher_id };
    if (batch_id) query.batch_id = batch_id;

    const classes = await ClassModel.find(query)
        .populate('batch_id', 'name subject status')
        .sort({ class_date: -1, class_time: -1 });

    res.status(200).json({
        status: true,
        message: "Classes fetched successfully",
        total: classes.length,
        data: classes
    });
});

// Get a single class by ID
exports.getClassById = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const teacher_id = req.user.userId;

    const classData = await ClassModel.findOne({ _id: id, teacher_id })
        .populate('batch_id', 'name subject status');

    if (!classData) {
        return next(new AppError("Class not found or access denied", 404));
    }

    res.status(200).json({
        status: true,
        message: "Class fetched successfully",
        data: classData
    });
});

// Update an existing class
exports.updateClass = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const teacher_id = req.user.userId;
    const { title, subject, batch_id, class_date, class_time, meeting_link } = req.body;

    const classData = await ClassModel.findOne({ _id: id, teacher_id });
    if (!classData) {
        return next(new AppError("Class not found or access denied", 404));
    }

    // If changing batch, verify ownership of the new batch
    if (batch_id && batch_id !== classData.batch_id.toString()) {
        const batch = await Batch.findOne({ _id: batch_id, teacher_id });
        if (!batch) {
            return next(new AppError("New associated batch not found or access denied.", 404));
        }
    }

    const updateData = {};
    if (title) updateData.title = title;
    if (subject) updateData.subject = subject;
    if (batch_id) updateData.batch_id = batch_id;
    if (class_date) updateData.class_date = class_date;
    if (class_time) updateData.class_time = class_time;
    if (meeting_link) updateData.meeting_link = meeting_link;

    const updatedClass = await ClassModel.findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
        .populate('batch_id', 'name subject');

    res.status(200).json({
        status: true,
        message: "Class updated successfully",
        data: updatedClass
    });
});

// Delete a class
exports.deleteClass = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const teacher_id = req.user.userId;

    const deletedClass = await ClassModel.findOneAndDelete({ _id: id, teacher_id });
    if (!deletedClass) {
        return next(new AppError("Class not found or access denied", 404));
    }

    res.status(200).json({
        status: true,
        message: "Class deleted successfully"
    });
});
