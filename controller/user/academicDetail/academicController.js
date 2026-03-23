const AcademicModel = require("../../../models/academic_model");
const cloudinary = require("../../../config/cloudinary");

// Helper function to upload multiple files to cloudinary
const uploadDocuments = async (files, user_id, educationLevel) => {
    try {
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
    } catch (error) {
        console.error("Cloudinary upload error:", error);
        throw new Error("Failed to upload documents to Cloudinary");
    }
};

// Create academic detail
const createAcademicDetail = async (req, res) => {
    try {
        const {
            educationLevel, education_level,
            degreeName, boardOrUniversity, location,
            startYear, endYear, isCurrentlyStudying,
            percentage, cgpa, grade, description
        } = req.body;

        const user_id = req.userInfo.userId;
        const level = educationLevel || education_level;

        if (!level) {
            return res.status(400).json({ status: false, message: "Education level is required." });
        }

        // Handle document uploads
        let documentUrls = [];
        if (req.files && req.files.documents) {
            documentUrls = await uploadDocuments(req.files.documents, user_id, level);
        }

        const newAcademicDetail = new AcademicModel({
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

        await newAcademicDetail.save();

        res.status(201).json({
            status: true,
            message: "Academic detail added successfully",
            data: newAcademicDetail
        });
    } catch (error) {
        console.error("Error creating academic detail:", error);
        res.status(500).json({ status: false, message: error.message || "Internal server error" });
    }
};

// Get all academic details for the logged-in user
const getMyAcademicDetails = async (req, res) => {
    try {
        const user_id = req.userInfo.userId;

        const details = await AcademicModel.find({ user_id }).sort({ startYear: -1 });

        res.status(200).json({
            status: true,
            message: "Academic details fetched successfully",
            data: details
        });
    } catch (error) {
        console.error("Error fetching academic details:", error);
        res.status(500).json({ status: false, message: "Internal server error" });
    }
};

// Get specific academic detail by ID
const getAcademicDetailById = async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.userInfo.userId;

        const detail = await AcademicModel.findOne({ _id: id, user_id });

        if (!detail) {
            return res.status(404).json({ status: false, message: "Academic detail not found or access denied" });
        }

        res.status(200).json({
            status: true,
            message: "Academic detail fetched successfully",
            data: detail
        });
    } catch (error) {
        console.error("Error fetching academic detail:", error);
        res.status(500).json({ status: false, message: "Internal server error" });
    }
};

// Update academic detail
const updateAcademicDetail = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            educationLevel, degreeName, boardOrUniversity, location,
            startYear, endYear, isCurrentlyStudying,
            percentage, cgpa, grade, description
        } = req.body;

        const user_id = req.userInfo.userId;

        const detail = await AcademicModel.findOne({ _id: id, user_id });
        if (!detail) {
            return res.status(404).json({ status: false, message: "Academic detail not found or access denied" });
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

        const updatedDetail = await AcademicModel.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );

        res.status(200).json({
            status: true,
            message: "Academic detail updated successfully",
            data: updatedDetail
        });
    } catch (error) {
        console.error("Error updating academic detail:", error);
        res.status(500).json({ status: false, message: error.message || "Internal server error" });
    }
};

// Delete academic detail
const deleteAcademicDetail = async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.userInfo.userId;

        const deletedDetail = await AcademicModel.findOneAndDelete({ _id: id, user_id });

        if (!deletedDetail) {
            return res.status(404).json({ status: false, message: "Academic detail not found or access denied" });
        }

        // Note: Ideally, we should also delete files from Cloudinary here. 
        // But since delete results in loss of history, usually we keep them or do it in a cleanup job.

        res.status(200).json({
            status: true,
            message: "Academic detail deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting academic detail:", error);
        res.status(500).json({ status: false, message: "Internal server error" });
    }
};

module.exports = {
    createAcademicDetail,
    getMyAcademicDetails,
    getAcademicDetailById,
    updateAcademicDetail,
    deleteAcademicDetail
};
