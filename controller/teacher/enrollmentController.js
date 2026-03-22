const EnrollmentModel = require("../../models/enrollment_model");
const BatchModel = require("../../models/batch_model");
const UserModel = require("../../models/user_model");
const { sendNotification } = require("../../services/notification_manager");

// Enroll multiple students into a batch
const enrollStudents = async (req, res) => {
    try {
        const { batch_id, student_ids } = req.body;

        if (!batch_id) {
            return res.status(400).json({ status: false, message: "batch_id is required." });
        }

        if (!student_ids || !Array.isArray(student_ids) || student_ids.length === 0) {
            return res.status(400).json({ status: false, message: "student_ids must be a non-empty array." });
        }

        // 1. Verify the batch exists
        const batch = await BatchModel.findById(batch_id);
        if (!batch) {
            return res.status(404).json({ status: false, message: "Batch not found." });
        }

        // 2. Verify all students exist and have the 'student' role
        const validStudents = await UserModel.find({
            _id: { $in: student_ids },
            role: 'student',
            is_deleted: false
        });

        if (validStudents.length !== student_ids.length) {
            return res.status(400).json({
                status: false,
                message: "One or more student IDs are invalid, deleted, or do not belong to a student."
            });
        }

        // 3. Prepare enrollment records
        const enrollmentsToCreate = student_ids.map(student_id => ({
            batch_id,
            student_id,
            status: 'active'
        }));

        // 4. Insert records using insertMany
        // `ordered: false` allows valid, non-duplicate records to be inserted even if some fail due to duplicate keys (11000)
        let insertedCount = 0;
        try {
            const result = await EnrollmentModel.insertMany(enrollmentsToCreate, { ordered: false });
            insertedCount = result.length;
        } catch (insertError) {
            // Handle bulk write errors: if some students are already enrolled, they throw a duplicate key error (11000)
            if (insertError.code === 11000 || insertError.writeErrors) {
                // Determine how many were successfully inserted before the duplicate errors
                insertedCount = insertError.insertedDocs ? insertError.insertedDocs.length : 0;
            } else {
                throw insertError; // Re-throw if it is a different kind of error
            }
        }

        // --- Notification Logic ---
        if (insertedCount > 0) {
            // If it was a bulk insert, we need to know WHICH students were newly inserted
            // For simplicity in this logic, we'll notify all IDs passed that were successfully processed
            // (In a more complex scenario, we'd filter by the result of insertMany)
            await sendNotification({
                recipients: student_ids,
                sender_id: req.userInfo ? req.userInfo.id : null,
                title: "New Enrollment",
                message: `You have been successfully enrolled in the batch: ${batch.name}`,
                type: 'info',
                related_id: batch._id
            });
        }
        // --------------------------

        res.status(201).json({
            status: true,
            message: `Successfully enrolled ${insertedCount} new student(s).`,
            already_enrolled_count: student_ids.length - insertedCount
        });

    } catch (error) {
        console.error("Error enrolling students:", error);
        res.status(500).json({ status: false, message: "Internal server error" });
    }
};

// Fetch all active students enrolled in a specific batch
const getStudentsByBatchId = async (req, res) => {
    try {
        const { batch_id } = req.params;

        const enrollments = await EnrollmentModel.find({ batch_id, status: 'active' })
            .populate('student_id', 'name email mobile unique_id profile_picture gender')
            .sort({ enrollment_date: -1 });

        const students = enrollments.map(enrollment => {
            if (!enrollment.student_id) return null; 

            return {
                enrollment_id: enrollment._id,
                enrollment_date: enrollment.enrollment_date,
                status: enrollment.status,
                ...enrollment.student_id._doc
            };
        }).filter(item => item !== null);

        res.status(200).json({
            status: true,
            message: "Students fetched successfully",
            data: students
        });
    } catch (error) {
        console.error("Error fetching enrolled students:", error);
        res.status(500).json({ status: false, message: "Internal server error" });
    }
};

module.exports = {
    enrollStudents,
    getStudentsByBatchId
};
