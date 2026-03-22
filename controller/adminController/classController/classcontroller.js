const ClassModel = require("../../../models/class_model");
const BatchModel = require("../../../models/batch_model");
const UserModel = require("../../../models/user_model");

// Create a new class
const createClass = async (req, res) => {
    try {
        const { title, subject, batch_id, class_date, class_time, meeting_link, teacher_id } = req.body;

        if (!title) {
            return res.status(400).json({ status: false, message: "title is required." });
        }
        if (!class_date) {
            return res.status(400).json({ status: false, message: "class_date is required." });
        }
        if (!class_time) {
            return res.status(400).json({ status: false, message: "class_time is required." });
        }

        if (!batch_id) {
            return res.status(400).json({ status: false, message: "batch_id is required." });
        }
        const batch = await BatchModel.findById(batch_id);
        if (!batch) {
            return res.status(404).json({ status: false, message: "Batch not found." });
        }

        if (teacher_id) {
            const teacher = await UserModel.findById(teacher_id);
            if (!teacher || teacher.role !== 'teacher' || teacher.is_deleted) {
                return res.status(400).json({ status: false, message: "Invalid teacher ID or user is not a teacher." });
            }
        }

        const newClass = new ClassModel({
            title,
            subject,
            batch_id,
            class_date,
            class_time,
            meeting_link,
            teacher_id,
        });

        await newClass.save();

        res.status(201).json({
            status: true,
            message: "Class created successfully",
            data: newClass
        });
    } catch (error) {
        console.error("Error creating class:", error);
        res.status(500).json({ status: false, message: "Internal server error" });
    }
};

const getAllClasses = async (req, res) => {
    try {
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
            .sort({ class_date: -1 }) // Sort by class date descending
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
    } catch (error) {
        console.error("Error fetching classes:", error);
        res.status(500).json({ status: false, message: "Internal server error" });
    }
};

// Get a single class by ID
const getClassById = async (req, res) => {
    try {
        const classItem = await ClassModel.findById(req.params.id)
            .populate('batch_id', 'name status subject')
            .populate('teacher_id', 'name email unique_id mobile profile_picture');

        if (!classItem) {
            return res.status(404).json({ status: false, message: "Class not found" });
        }

        res.status(200).json({
            status: true,
            message: "Class fetched successfully",
            data: classItem
        });
    } catch (error) {
        console.error("Error fetching class:", error);
        res.status(500).json({ status: false, message: "Internal server error" });
    }
};

// Update an existing class
const updateClass = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, subject, batch_id, class_date, class_time, meeting_link, teacher_id } = req.body;

        const existingClass = await ClassModel.findById(id);
        if (!existingClass) {
            return res.status(404).json({ status: false, message: "Class not found" });
        }

        if (batch_id) {
            const batch = await BatchModel.findById(batch_id);
            if (!batch) {
                return res.status(404).json({ status: false, message: "Batch not found." });
            }
        }

        if (teacher_id) {
            const teacher = await UserModel.findById(teacher_id);
            if (!teacher || teacher.role !== 'teacher' || teacher.is_deleted) {
                return res.status(400).json({ status: false, message: "Invalid teacher ID or user is not a teacher." });
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

        const updatedClass = await ClassModel.findByIdAndUpdate(id, updateData, { new: true })
            .populate('batch_id', 'name subject')
            .populate('teacher_id', 'name email unique_id');

        res.status(200).json({
            status: true,
            message: "Class updated successfully",
            data: updatedClass
        });
    } catch (error) {
        console.error("Error updating class:", error);
        res.status(500).json({ status: false, message: "Internal server error" });
    }
};

// Delete a class
const deleteClass = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedClass = await ClassModel.findByIdAndDelete(id);
        if (!deletedClass) {
            return res.status(404).json({ status: false, message: "Class not found or already deleted" });
        }

        res.status(200).json({
            status: true,
            message: "Class deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting class:", error);
        res.status(500).json({ status: false, message: "Internal server error" });
    }
};

// Get classes by Teacher ID
const getClassesByTeacherId = async (req, res) => {
    try {
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
    } catch (error) {
        console.error("Error fetching classes by teacher:", error);
        res.status(500).json({ status: false, message: "Internal server error" });
    }
};

module.exports = {
    createClass,
    getAllClasses,
    getClassById,
    updateClass,
    deleteClass,
    getClassesByTeacherId
};
