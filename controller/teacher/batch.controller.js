const { Batch, User } = require("../../models");
const catchAsync = require("../../utils/catchAsync");
const AppError = require("../../utils/appError");

// Create a new batch (teacher_id is automatically set)
exports.createBatch = catchAsync(async (req, res, next) => {
    const { name, subject, description, start_date, end_date, status } = req.body;
    const teacher_id = req.user.userId;

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

// Get all batches for the logged-in teacher
exports.getMyBatches = catchAsync(async (req, res, next) => {
    const teacher_id = req.user.userId;

    const batches = await Batch.find({ teacher_id })
        .populate('enrolled_students', 'name unique_id profile_picture')
        .sort({ createdAt: -1 });

    res.status(200).json({
        status: true,
        message: "Batches fetched successfully",
        total: batches.length,
        data: batches
    });
});

// Get a single batch by ID (owned by this teacher)
exports.getBatchById = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const teacher_id = req.user.userId;

    const batch = await Batch.findOne({ _id: id, teacher_id })
        .populate('enrolled_students', 'name email unique_id profile_picture gender');

    if (!batch) {
        return next(new AppError("Batch not found or access denied", 404));
    }

    res.status(200).json({
        status: true,
        message: "Batch fetched successfully",
        data: batch
    });
});

// Update an existing batch (owned by this teacher)
exports.updateBatch = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const teacher_id = req.user.userId;
    const { name, subject, description, start_date, end_date, status, add_students, remove_students } = req.body;

    const batch = await Batch.findOne({ _id: id, teacher_id });
    if (!batch) {
        return next(new AppError("Batch not found or access denied", 404));
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (subject) updateData.subject = subject;
    if (description) updateData.description = description;
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

    const updatedBatch = await Batch.findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
        .populate('enrolled_students', 'name email unique_id profile_picture');

    res.status(200).json({
        status: true,
        message: "Batch updated successfully",
        data: updatedBatch
    });
});

// Delete a batch (owned by this teacher)
exports.deleteBatch = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const teacher_id = req.user.userId;

    const deletedBatch = await Batch.findOneAndDelete({ _id: id, teacher_id });
    if (!deletedBatch) {
        return next(new AppError("Batch not found or access denied", 404));
    }

    res.status(200).json({
        status: true,
        message: "Batch deleted successfully"
    });
});
