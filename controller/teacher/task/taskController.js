const TaskModel = require("../../../models/task_model");
const BatchModel = require("../../../models/batch_model");

// Create a new task
const createTask = async (req, res) => {
    try {
        const { title, description, subject, batch_id, assigned_date, due_date, attachment_url } = req.body;
        const teacher_id = req.userInfo.id; // Comes safely from teacherMiddleware

        if (!title || !batch_id) {
            return res.status(400).json({ status: false, message: "Title and batch_id are required." });
        }

        const batch = await BatchModel.findById(batch_id);
        if (!batch) {
            return res.status(404).json({ status: false, message: "Batch not found." });
        }

        const newTask = new TaskModel({
            title,
            description,
            subject,
            batch_id,
            assigned_date,
            due_date,
            attachment_url,
            teacher_id
        });

        await newTask.save();

        res.status(201).json({
            status: true,
            message: "Task created successfully",
            data: newTask
        });
    } catch (error) {
        console.error("Error creating task:", error);
        res.status(500).json({ status: false, message: "Internal server error" });
    }
};

// Get all tasks for the logged-in teacher
const getAllTasks = async (req, res) => {
    try {
        const teacher_id = req.userInfo.id;
        const { batch_id } = req.query;

        let query = { teacher_id };
        if (batch_id) query.batch_id = batch_id; // Optionally filter by a specific batch

        const tasks = await TaskModel.find(query)
            .populate('batch_id', 'name subject status enrolled_students')
            .sort({ createdAt: -1 });

        res.status(200).json({
            status: true,
            message: "Tasks fetched successfully",
            data: tasks
        });
    } catch (error) {
        console.error("Error fetching tasks:", error);
        res.status(500).json({ status: false, message: "Internal server error" });
    }
};

// Get a single task by ID
const getTaskById = async (req, res) => {
    try {
        const task = await TaskModel.findById(req.params.id)
            .populate('batch_id', 'name subject status enrolled_students');

        if (!task) {
            return res.status(404).json({ status: false, message: "Task not found" });
        }

        res.status(200).json({
            status: true,
            message: "Task fetched successfully",
            data: task
        });
    } catch (error) {
        console.error("Error fetching task:", error);
        res.status(500).json({ status: false, message: "Internal server error" });
    }
};

// Update an existing task
const updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, subject, batch_id, assigned_date, due_date, attachment_url } = req.body;
        const teacher_id = req.userInfo.id;

        // Ensure task belongs to the logged-in teacher before updating
        const task = await TaskModel.findOne({ _id: id, teacher_id });
        if (!task) {
            return res.status(404).json({ status: false, message: "Task not found or access denied" });
        }

        const updateData = {};
        if (title) updateData.title = title;
        if (description) updateData.description = description;
        if (subject) updateData.subject = subject;
        if (batch_id) updateData.batch_id = batch_id;
        if (assigned_date) updateData.assigned_date = assigned_date;
        if (due_date) updateData.due_date = due_date;
        if (attachment_url) updateData.attachment_url = attachment_url;

        const updatedTask = await TaskModel.findByIdAndUpdate(id, updateData, { new: true })
            .populate('batch_id', 'name subject');

        res.status(200).json({
            status: true,
            message: "Task updated successfully",
            data: updatedTask
        });
    } catch (error) {
        console.error("Error updating task:", error);
        res.status(500).json({ status: false, message: "Internal server error" });
    }
};

// Delete a task entirely
const deleteTask = async (req, res) => {
    try {
        const { id } = req.params;
        const teacher_id = req.userInfo.id;

        // Ensure task belongs to the logged-in teacher before deleting
        const deletedTask = await TaskModel.findOneAndDelete({ _id: id, teacher_id });
        if (!deletedTask) {
            return res.status(404).json({ status: false, message: "Task not found or access denied" });
        }

        res.status(200).json({
            status: true,
            message: "Task permanently deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting task:", error);
        res.status(500).json({ status: false, message: "Internal server error" });
    }
};

module.exports = {
    createTask,
    getAllTasks,
    getTaskById,
    updateTask,
    deleteTask
};
