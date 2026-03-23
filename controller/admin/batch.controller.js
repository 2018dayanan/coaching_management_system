const { Batch, User } = require("../../models");
const catchAsync = require("../../utils/catchAsync");
const AppError = require("../../utils/appError");

exports.createBatch = catchAsync(async (req, res, next) => {
    const { name, subject, description, teacher_id, start_date, end_date, status } = req.body;

    if (teacher_id) {
        const teacher = await User.findById(teacher_id);
        if (!teacher || teacher.role !== 'teacher' || teacher.is_deleted) {
            return next(new AppError("Invalid teacher ID or user is not a teacher.", 400));
        }
    }

    const newBatch = await Batch.create({
        name,
        subject,
        description,
        teacher_id,
        start_date,
        end_date,
        status: status || 'active'
    });

    res.status(201).json({
        status: true,
        message: "Batch created successfully",
        data: newBatch
    });
});

exports.getAllBatches = catchAsync(async (req, res, next) => {
    const { search, status, page = 1, limit = 10 } = req.query;
    let query = {};

    if (status) query.status = status;
    
    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { subject: { $regex: search, $options: 'i' } }
        ];
    }

    const skip = (page - 1) * limit;

    const batches = await Batch.find(query)
        .populate('teacher_id', 'name email unique_id mobile')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    const total = await Batch.countDocuments(query);

    res.status(200).json({
        status: true,
        message: "Batches fetched successfully",
        data: {
            batches,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / limit)
            }
        }
    });
});

// Get a single batch by ID
exports.getBatchById = catchAsync(async (req, res, next) => {
    const batch = await Batch.findById(req.params.id)
        .populate('teacher_id', 'name email unique_id mobile profile_picture');
    
    if (!batch) {
        return next(new AppError("Batch not found", 404));
    }

    res.status(200).json({
        status: true,
        message: "Batch fetched successfully",
        data: batch
    });
});

// Update an existing batch
exports.updateBatch = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { name, subject, description, teacher_id, start_date, end_date, status } = req.body;

    const batch = await Batch.findById(id);
    if (!batch) {
        return next(new AppError("Batch not found", 404));
    }

    if (teacher_id) {
        const teacher = await User.findById(teacher_id);
        if (!teacher || teacher.role !== 'teacher' || teacher.is_deleted) {
            return next(new AppError("Invalid teacher ID or user is not a teacher.", 400));
        }
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (subject) updateData.subject = subject;
    if (description) updateData.description = description;
    if (teacher_id) updateData.teacher_id = teacher_id;
    if (start_date) updateData.start_date = start_date;
    if (end_date) updateData.end_date = end_date;
    if (status) updateData.status = status;

    const updatedBatch = await Batch.findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
        .populate('teacher_id', 'name email unique_id');

    res.status(200).json({
        status: true,
        message: "Batch updated successfully",
        data: updatedBatch
    });
});

// Delete a batch entirely
exports.deleteBatch = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const batch = await Batch.findByIdAndDelete(id);
    if (!batch) {
        return next(new AppError("Batch not found or already deleted", 404));
    }

    res.status(200).json({
        status: true,
        message: "Batch permanently deleted successfully"
    });
});
