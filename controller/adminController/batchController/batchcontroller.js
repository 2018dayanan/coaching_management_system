const BatchModel = require("../../../models/batch_model");
const UserModel = require("../../../models/user_model");

// Create a new batch
const createBatch = async (req, res) => {
    try {
        const { name, subject, description, teacher_id, start_date, end_date, status } = req.body;

        // Ensure the teacher exists and has the role of 'teacher'
        if (teacher_id) {
            const teacher = await UserModel.findById(teacher_id);
            if (!teacher || teacher.role !== 'teacher' || teacher.is_deleted) {
                return res.status(400).json({ status: false, message: "Invalid teacher ID or user is not a teacher." });
            }
        }

        const newBatch = new BatchModel({
            name,
            subject,
            description,
            teacher_id,
            start_date,
            end_date,
            status: status || 'active'
        });

        await newBatch.save();

        res.status(201).json({
            status: true,
            message: "Batch created successfully",
            data: newBatch
        });
    } catch (error) {
        console.error("Error creating batch:", error);
        res.status(500).json({ status: false, message: "Internal server error" });
    }
};

// Get all batches (with optional search and populated teacher details)
const getAllBatches = async (req, res) => {
    try {
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

        const batches = await BatchModel.find(query)
            .populate('teacher_id', 'name email unique_id mobile') // Populates teacher data smoothly
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await BatchModel.countDocuments(query);

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
    } catch (error) {
        console.error("Error fetching batches:", error);
        res.status(500).json({ status: false, message: "Internal server error" });
    }
};

// Get a single batch by ID
const getBatchById = async (req, res) => {
    try {
        const batch = await BatchModel.findById(req.params.id)
            .populate('teacher_id', 'name email unique_id mobile profile_picture');
        
        if (!batch) {
            return res.status(404).json({ status: false, message: "Batch not found" });
        }

        res.status(200).json({
            status: true,
            message: "Batch fetched successfully",
            data: batch
        });
    } catch (error) {
        console.error("Error fetching batch:", error);
        res.status(500).json({ status: false, message: "Internal server error" });
    }
};

// Update an existing batch
const updateBatch = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, subject, description, teacher_id, start_date, end_date, status } = req.body;

        const batch = await BatchModel.findById(id);
        if (!batch) {
            return res.status(404).json({ status: false, message: "Batch not found" });
        }

        if (teacher_id) {
            const teacher = await UserModel.findById(teacher_id);
            if (!teacher || teacher.role !== 'teacher' || teacher.is_deleted) {
                return res.status(400).json({ status: false, message: "Invalid teacher ID or user is not a teacher." });
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

        const updatedBatch = await BatchModel.findByIdAndUpdate(id, updateData, { new: true })
            .populate('teacher_id', 'name email unique_id');

        res.status(200).json({
            status: true,
            message: "Batch updated successfully",
            data: updatedBatch
        });
    } catch (error) {
        console.error("Error updating batch:", error);
        res.status(500).json({ status: false, message: "Internal server error" });
    }
};

// Delete a batch entirely
const deleteBatch = async (req, res) => {
    try {
        const { id } = req.params;

        const batch = await BatchModel.findByIdAndDelete(id);
        if (!batch) {
            return res.status(404).json({ status: false, message: "Batch not found or already deleted" });
        }

        res.status(200).json({
            status: true,
            message: "Batch permanently deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting batch:", error);
        res.status(500).json({ status: false, message: "Internal server error" });
    }
};

module.exports = {
    createBatch,
    getAllBatches,
    getBatchById,
    updateBatch,
    deleteBatch
};
