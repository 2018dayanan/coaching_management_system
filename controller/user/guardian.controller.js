const { Guardian } = require("../../models");
const catchAsync = require("../../utils/catchAsync");
const AppError = require("../../utils/appError");

// Create guardian detail
exports.createGuardian = catchAsync(async (req, res, next) => {
    const { guardianName, guardianPhone, guardianRelationship, isPrimary } = req.body;
    const user_id = req.user.userId;

    if (!guardianName || !guardianPhone || !guardianRelationship) {
        return next(new AppError("Name, phone, and relationship are required.", 400));
    }

    // If this is set as primary, unset other primary guardians for this user
    if (isPrimary === true) {
        await Guardian.updateMany({ user_id }, { isPrimary: false });
    }

    const newGuardian = await Guardian.create({
        user_id,
        guardianName,
        guardianPhone,
        guardianRelationship,
        isPrimary: isPrimary !== undefined ? isPrimary : true
    });

    const result = newGuardian.toObject();
    delete result.createdAt;
    delete result.updatedAt;
    delete result.__v;

    res.status(201).json({
        status: true,
        message: "Guardian added successfully",
        data: result
    });
});

// Get all guardians for the logged-in user
exports.getMyGuardians = catchAsync(async (req, res, next) => {
    const user_id = req.user.userId;

    const guardians = await Guardian.find({ user_id })
        .select("-createdAt -updatedAt -__v")
        .sort({ isPrimary: -1, createdAt: -1 });

    res.status(200).json({
        status: true,
        message: "Guardians fetched successfully",
        data: guardians
    });
});

// Get specific guardian by ID
exports.getGuardianById = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const user_id = req.user.userId;

    const guardian = await Guardian.findOne({ _id: id, user_id }).select("-createdAt -updatedAt -__v");

    if (!guardian) {
        return next(new AppError("Guardian not found or access denied", 404));
    }

    res.status(200).json({
        status: true,
        message: "Guardian fetched successfully",
        data: guardian
    });
});

// Update guardian detail
exports.updateGuardian = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { guardianName, guardianPhone, guardianRelationship, isPrimary } = req.body;
    const user_id = req.user.userId;

    const guardian = await Guardian.findOne({ _id: id, user_id });
    if (!guardian) {
        return next(new AppError("Guardian not found or access denied", 404));
    }

    // If this is being set as primary, unset others
    if (isPrimary === true) {
        await Guardian.updateMany({ user_id }, { isPrimary: false });
    }

    const updateData = {};
    if (guardianName) updateData.guardianName = guardianName;
    if (guardianPhone) updateData.guardianPhone = guardianPhone;
    if (guardianRelationship) updateData.guardianRelationship = guardianRelationship;
    if (isPrimary !== undefined) updateData.isPrimary = isPrimary;

    const updatedGuardian = await Guardian.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
    ).select("-createdAt -updatedAt -__v");

    res.status(200).json({
        status: true,
        message: "Guardian updated successfully",
        data: updatedGuardian
    });
});

// Delete guardian detail
exports.deleteGuardian = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const user_id = req.user.userId;

    const deletedGuardian = await Guardian.findOneAndDelete({ _id: id, user_id });

    if (!deletedGuardian) {
        return next(new AppError("Guardian not found or access denied", 404));
    }

    res.status(200).json({
        status: true,
        message: "Guardian deleted successfully"
    });
});
