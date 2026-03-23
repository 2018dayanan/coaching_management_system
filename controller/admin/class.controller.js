const { ClassModel, Batch, User } = require("../../models");
const catchAsync = require("../../utils/catchAsync");
const AppError = require("../../utils/appError");

// Create a new class
exports.createClass = catchAsync(async (req, res, next) => {
    const { title, subject, batch_id, class_date, class_time, meeting_link, teacher_id } = req.body;

    if (!title || !class_date || !class_time || !batch_id) {
        return next(new AppError("Title, batch_id, class_date and class_time are required.", 400));
    }

    const batch = await Batch.findById(batch_id);
    if (!batch) {
        return next(new AppError("Batch not found.", 404));
    }

    if (teacher_id) {
        const teacher = await User.findById(teacher_id);
        if (!teacher || teacher.role !== 'teacher' || teacher.is_deleted) {
            return next(new AppError("Invalid teacher ID or user is not a teacher.", 400));
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
    });

    res.status(201).json({
        status: true,
        message: "Class created successfully",
        data: newClass
    });
});

exports.getAllClasses = catchAsync(async (req, res, next) => {
    const { search, batch_id, teacher_id, page = 1, limit = 10 } = req.query;
    let query = {};

    if (batch_id) query.batch_id = batch_id;
    if (teacher_id) query.teacher_id = teacher_id;

    if (search) {
        query.$or = [
            { title: { $regex: search, $options: 'i' } },
            { subject: { $regex: search, $options: 'i' } }
        ];
    }

    const skip = (page - 1) * limit;

    const classes = await ClassModel.find(query)
        .populate('batch_id', 'name status start_date end_date')
        .populate('teacher_id', 'name email unique_id profile_picture')
        .sort({ class_date: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    const total = await ClassModel.countDocuments(query);

    res.status(200).json({
        status: true,
        message: "Classes fetched successfully",
        data: {
            classes,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / limit)
            }
        }
    });
});

// Get a single class by ID
exports.getClassById = catchAsync(async (req, res, next) => {
    const classItem = await ClassModel.findById(req.params.id)
        .populate('batch_id', 'name status subject')
        .populate('teacher_id', 'name email unique_id mobile profile_picture');

    if (!classItem) {
        return next(new AppError("Class not found", 404));
    }

    res.status(200).json({
        status: true,
        message: "Class fetched successfully",
        data: classItem
    });
});

// Update an existing class
exports.updateClass = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { title, subject, batch_id, class_date, class_time, meeting_link, teacher_id } = req.body;

    const existingClass = await ClassModel.findById(id);
    if (!existingClass) {
        return next(new AppError("Class not found", 404));
    }

    if (batch_id) {
        const batch = await Batch.findById(batch_id);
        if (!batch) {
            return next(new AppError("Batch not found.", 404));
        }
    }

    if (teacher_id) {
        const teacher = await User.findById(teacher_id);
        if (!teacher || teacher.role !== 'teacher' || teacher.is_deleted) {
            return next(new AppError("Invalid teacher ID or user is not a teacher.", 400));
        }
    }

    const updateData = {};
    if (title) updateData.title = title;
    if (subject) updateData.subject = subject;
    if (batch_id) updateData.batch_id = batch_id;
    if (class_date) updateData.class_date = class_date;
    if (class_time) updateData.class_time = class_time;
    if (meeting_link) updateData.meeting_link = meeting_link;
    if (teacher_id) updateData.teacher_id = teacher_id;

    const updatedClass = await ClassModel.findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
        .populate('batch_id', 'name subject')
        .populate('teacher_id', 'name email unique_id');

    res.status(200).json({
        status: true,
        message: "Class updated successfully",
        data: updatedClass
    });
});

// Delete a class
exports.deleteClass = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const deletedClass = await ClassModel.findByIdAndDelete(id);
    if (!deletedClass) {
        return next(new AppError("Class not found or already deleted", 404));
    }

    res.status(200).json({
        status: true,
        message: "Class deleted successfully"
    });
});

// Get classes by Teacher ID
exports.getClassesByTeacherId = catchAsync(async (req, res, next) => {
    const { teacher_id } = req.params;
    const classes = await ClassModel.find({ teacher_id })
        .populate('batch_id', 'name status subject start_date end_date')
        .populate('teacher_id', 'name email unique_id profile_picture')
        .sort({ class_date: -1 });

    res.status(200).json({
        status: true,
        message: "Classes fetched successfully for the teacher",
        data: classes
    });
});
