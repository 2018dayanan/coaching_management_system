const EnrollmentModel = require("../../../models/enrollment_model");
const BatchModel = require("../../../models/batch_model");
const ClassModel = require("../../../models/class_model");

// Fetch all batches a student is enrolled in along with class details
const getMyEnrolledCourses = async (req, res) => {
    try {
        const student_id = req.userInfo.userId;

        const enrollments = await EnrollmentModel.find({ student_id, status: 'active' })
            .populate({
                path: 'batch_id',
                select: 'name subject description start_date end_date teacher_id status',
                populate: {
                    path: 'teacher_id',
                    select: 'name profile_picture'
                }
            })
            .sort({ createdAt: -1 });

        // Map through enrollments and attach classes for each batch
        const formattedCourses = await Promise.all(enrollments.map(async (enrollment) => {
            if (!enrollment.batch_id) return null;

            // Find all classes associated with this batch
            const classes = await ClassModel.find({ batch_id: enrollment.batch_id._id })
                .select('title subject class_date class_time meeting_link')
                .sort({ class_date: 1, class_time: 1 });

            // Extract teacher detail and clean up batch object
            const batchObj = enrollment.batch_id.toObject();
            const teacherDetail = batchObj.teacher_id;
            delete batchObj.teacher_id;

            return {
                enrollment_id: enrollment._id,
                enrollment_date: enrollment.enrollment_date,
                batch: batchObj,
                teacherDetail: teacherDetail || null,
                classes: classes || []
            };
        }));

        const finalData = formattedCourses.filter(item => item !== null);

        res.status(200).json({
            status: true,
            message: "Enrolled courses and classes fetched successfully",
            data: finalData
        });
    } catch (error) {
        console.error("Error fetching enrolled courses:", error);
        res.status(500).json({ status: false, message: "Internal server error" });
    }
};

module.exports = {
    getMyEnrolledCourses
};
