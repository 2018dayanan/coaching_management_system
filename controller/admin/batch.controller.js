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
        .populate('enrolled_students', 'name email unique_id profile_picture')
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
        .populate('teacher_id', 'name email unique_id mobile profile_picture')
        .populate('enrolled_students', 'name email unique_id profile_picture');

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
    const { name, subject, description, teacher_id, start_date, end_date, status, add_students, remove_students } = req.body;

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

    // Add students to enrolled_students
    if (add_students && Array.isArray(add_students) && add_students.length > 0) {
        for (const studentId of add_students) {
            const student = await User.findById(studentId);
            if (!student || student.role !== 'student' || student.is_deleted) {
                return next(new AppError(`Invalid student ID: ${studentId}. User not found or is not a student.`, 400));
            }
        }
        await Batch.findByIdAndUpdate(id, {
            $addToSet: { enrolled_students: { $each: add_students } }
        });
    }

    // Remove students from enrolled_students
    if (remove_students && Array.isArray(remove_students) && remove_students.length > 0) {
        await Batch.findByIdAndUpdate(id, {
            $pull: { enrolled_students: { $in: remove_students } }
        });
    }

    // Apply remaining field updates
    const updatedBatch = await Batch.findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
        .populate('teacher_id', 'name email unique_id')
        .populate('enrolled_students', 'name email unique_id profile_picture');

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
