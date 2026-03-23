const GuardianModel = require("../../../models/guardian_model");

// Create guardian detail
const createGuardian = async (req, res) => {
    try {
        const { guardianName, guardianPhone, guardianRelationship, isPrimary } = req.body;
        const user_id = req.userInfo.userId;

        if (!guardianName || !guardianPhone || !guardianRelationship) {
            return res.status(400).json({ status: false, message: "Name, phone, and relationship are required." });
        }

        // If this is set as primary, unset other primary guardians for this user
        if (isPrimary === true) {
            await GuardianModel.updateMany({ user_id }, { isPrimary: false });
        }

        const newGuardian = new GuardianModel({
            user_id,
            guardianName,
            guardianPhone,
            guardianRelationship,
            isPrimary: isPrimary !== undefined ? isPrimary : true
        });

        await newGuardian.save();

        const result = newGuardian.toObject();
        delete result.createdAt;
        delete result.updatedAt;
        delete result.__v;

        res.status(201).json({
            status: true,
            message: "Guardian added successfully",
            data: result
        });
    } catch (error) {
        console.error("Error creating guardian:", error);
        res.status(500).json({ status: false, message: "Internal server error" });
    }
};

// Get all guardians for the logged-in user
const getMyGuardians = async (req, res) => {
    try {
        const user_id = req.userInfo.userId;

        const guardians = await GuardianModel.find({ user_id })
            .select("-createdAt -updatedAt -__v")
            .sort({ isPrimary: -1, createdAt: -1 });

        res.status(200).json({
            status: true,
            message: "Guardians fetched successfully",
            data: guardians
        });
    } catch (error) {
        console.error("Error fetching guardians:", error);
        res.status(500).json({ status: false, message: "Internal server error" });
    }
};

// Get specific guardian by ID
const getGuardianById = async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.userInfo.userId;

        const guardian = await GuardianModel.findOne({ _id: id, user_id }).select("-createdAt -updatedAt -__v");

        if (!guardian) {
            return res.status(404).json({ status: false, message: "Guardian not found or access denied" });
        }

        res.status(200).json({
            status: true,
            message: "Guardian fetched successfully",
            data: guardian
        });
    } catch (error) {
        console.error("Error fetching guardian:", error);
        res.status(500).json({ status: false, message: "Internal server error" });
    }
};

// Update guardian detail
const updateGuardian = async (req, res) => {
    try {
        const { id } = req.params;
        const { guardianName, guardianPhone, guardianRelationship, isPrimary } = req.body;
        const user_id = req.userInfo.userId;

        const guardian = await GuardianModel.findOne({ _id: id, user_id });
        if (!guardian) {
            return res.status(404).json({ status: false, message: "Guardian not found or access denied" });
        }

        // If this is being set as primary, unset others
        if (isPrimary === true) {
            await GuardianModel.updateMany({ user_id }, { isPrimary: false });
        }

        const updateData = {};
        if (guardianName) updateData.guardianName = guardianName;
        if (guardianPhone) updateData.guardianPhone = guardianPhone;
        if (guardianRelationship) updateData.guardianRelationship = guardianRelationship;
        if (isPrimary !== undefined) updateData.isPrimary = isPrimary;

        const updatedGuardian = await GuardianModel.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        ).select("-createdAt -updatedAt -__v");

        res.status(200).json({
            status: true,
            message: "Guardian updated successfully",
            data: updatedGuardian
        });
    } catch (error) {
        console.error("Error updating guardian:", error);
        res.status(500).json({ status: false, message: "Internal server error" });
    }
};

// Delete guardian detail
const deleteGuardian = async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.userInfo.userId;

        const deletedGuardian = await GuardianModel.findOneAndDelete({ _id: id, user_id });

        if (!deletedGuardian) {
            return res.status(404).json({ status: false, message: "Guardian not found or access denied" });
        }

        res.status(200).json({
            status: true,
            message: "Guardian deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting guardian:", error);
        res.status(500).json({ status: false, message: "Internal server error" });
    }
};

module.exports = {
    createGuardian,
    getMyGuardians,
    getGuardianById,
    updateGuardian,
    deleteGuardian
};
