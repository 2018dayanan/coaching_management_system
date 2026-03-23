const { Batch } = require("../../models");
const catchAsync = require("../../utils/catchAsync");

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
