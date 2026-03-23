const { Academic } = require("../../models");
const cloudinary = require("../../config/cloudinary");
const catchAsync = require("../../utils/catchAsync");
const AppError = require("../../utils/appError");

// Helper function to upload multiple files to cloudinary
const uploadDocuments = async (files, user_id, educationLevel) => {
    if (!files) return [];
    
    const fileList = Array.isArray(files) ? files : [files];
    const uploadedUrls = [];

    for (const file of fileList) {
        const base64Media = `data:${file.mimetype};base64,${file.data.toString('base64')}`;
        const uploadOptions = {
            folder: `user_academic_docs/${user_id}/${educationLevel}`,
            resource_type: 'auto', 
            public_id: `doc_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        };

        const result = await cloudinary.uploader.upload(base64Media, uploadOptions);
        uploadedUrls.push(result.secure_url);
    }

    return uploadedUrls;
};

// Create academic detail
exports.createAcademicDetail = catchAsync(async (req, res, next) => {
    const { 
        educationLevel, education_level,
        degreeName, boardOrUniversity, location, 
        startYear, endYear, isCurrentlyStudying, 
        percentage, cgpa, grade, description 
    } = req.body;
    
    const user_id = req.user.userId;
    const level = educationLevel || education_level;

    if (!level) {
        return next(new AppError("Education level is required.", 400));
    }

    // Handle document uploads
    let documentUrls = [];
    if (req.files && req.files.documents) {
        documentUrls = await uploadDocuments(req.files.documents, user_id, level);
    }

    const newAcademicDetail = await Academic.create({
        user_id,
        educationLevel: level,
        degreeName,
        boardOrUniversity,
        location,
        startYear,
        endYear,
        isCurrentlyStudying,
        percentage,
        cgpa,
        grade,
        description,
        documents: documentUrls
    });

    res.status(201).json({
        status: true,
        message: "Academic detail added successfully",
        data: newAcademicDetail
    });
});

// Get all academic details for the logged-in user
exports.getMyAcademicDetails = catchAsync(async (req, res, next) => {
    const user_id = req.user.userId;

    const details = await Academic.find({ user_id }).sort({ startYear: -1 });

    res.status(200).json({
        status: true,
        message: "Academic details fetched successfully",
        data: details
    });
});

// Get specific academic detail by ID
exports.getAcademicDetailById = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const user_id = req.user.userId;

    const detail = await Academic.findOne({ _id: id, user_id });

    if (!detail) {
        return next(new AppError("Academic detail not found or access denied", 404));
    }

    res.status(200).json({
        status: true,
        message: "Academic detail fetched successfully",
        data: detail
    });
});

// Update academic detail
exports.updateAcademicDetail = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { 
        educationLevel, degreeName, boardOrUniversity, location, 
        startYear, endYear, isCurrentlyStudying, 
        percentage, cgpa, grade, description 
    } = req.body;
    
    const user_id = req.user.userId;

    const detail = await Academic.findOne({ _id: id, user_id });
    if (!detail) {
        return next(new AppError("Academic detail not found or access denied", 404));
    }

    const updateData = {};
    if (educationLevel) updateData.educationLevel = educationLevel;
    if (degreeName) updateData.degreeName = degreeName;
    if (boardOrUniversity) updateData.boardOrUniversity = boardOrUniversity;
    if (location) updateData.location = location;
    if (startYear !== undefined) updateData.startYear = startYear;
    if (endYear !== undefined) updateData.endYear = endYear;
    if (isCurrentlyStudying !== undefined) updateData.isCurrentlyStudying = isCurrentlyStudying;
    if (percentage !== undefined) updateData.percentage = percentage;
    if (cgpa !== undefined) updateData.cgpa = cgpa;
    if (grade) updateData.grade = grade;
    if (description) updateData.description = description;

    // Handle new document uploads (append to existing ones)
    if (req.files && req.files.documents) {
        const newDocUrls = await uploadDocuments(req.files.documents, user_id, educationLevel || detail.educationLevel);
        updateData.documents = [...(detail.documents || []), ...newDocUrls];
    }

    const updatedDetail = await Academic.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
    );

    res.status(200).json({
        status: true,
        message: "Academic detail updated successfully",
        data: updatedDetail
    });
});

// Delete academic detail
exports.deleteAcademicDetail = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const user_id = req.user.userId;

    const deletedDetail = await Academic.findOneAndDelete({ _id: id, user_id });

    if (!deletedDetail) {
        return next(new AppError("Academic detail not found or access denied", 404));
    }

    res.status(200).json({
        status: true,
        message: "Academic detail deleted successfully"
    });
});
