const UserModel = require("../../../models/user_model");
const bcrypt = require('bcryptjs');
const cloudinary = require("../../../config/cloudinary");
const { sendEmail } = require("../../../services/emailManager");
const { generateActivationEmailContent } = require("../../../templates/email/statusTemplate");

// Admin create a user
const createUser = async (req, res) => {
    try {
        const { name, email, mobile, password, role, gender } = req.body;

        if (gender && !['male', 'female', 'other'].includes(gender.toLowerCase())) {
            return res.status(400).json({ status: false, message: "Invalid gender value." });
        }

        const existingUser = await UserModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ status: false, message: "User with this email already exists." });
        }

        const password_hash = await bcrypt.hash(password || '12345678', 12);

        // Generate unique_id
        const currentYear = new Date().getFullYear();
        const latestUser = await UserModel.findOne({ unique_id: new RegExp(`^STD-${currentYear}-`, 'i') }).sort({ unique_id: -1 });
        let nextSeq = 1;
        if (latestUser && latestUser.unique_id) {
            const parts = latestUser.unique_id.split('-');
            if (parts.length === 3) {
                nextSeq = parseInt(parts[2], 10) + 1;
            }
        }
        const unique_id = `STD-${currentYear}-${nextSeq.toString().padStart(4, '0')}`;

        const newUser = new UserModel({
            name,
            email,
            mobile,
            password_hash,
            gender: gender ? gender.toLowerCase() : 'male',
            unique_id,
            role: role || 'student',
            status: 'active' // Admin created users are active by default
        });

        await newUser.save();

        res.status(201).json({
            status: true,
            message: "User created successfully by admin",
            data: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                unique_id: newUser.unique_id,
                role: newUser.role
            }
        });
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ status: false, message: "Internal server error" });
    }
};


// Get all users (excluding deleted ones by default, optionally filtered by role/status)
const getAllUsers = async (req, res) => {
    try {
        const { role, status, search, page = 1, limit = 10 } = req.query;
        let query = { is_deleted: false };

        if (role) query.role = role;
        if (status) query.status = status;

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { unique_id: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (page - 1) * limit;

        const users = await UserModel.find(query)
            .select('-password_hash')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await UserModel.countDocuments(query);

        res.status(200).json({
            status: true,
            message: "Users fetched successfully",
            data: {
                users,
                pagination: {
                    total,
                    page: parseInt(page),
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ status: false, message: "Internal server error" });
    }
};

// Get a single user by ID
const getUserById = async (req, res) => {
    try {
        const user = await UserModel.findById(req.params.id).select('-password_hash');

        if (!user || user.is_deleted) {
            return res.status(404).json({ status: false, message: "User not found" });
        }

        res.status(200).json({
            status: true,
            message: "User fetched successfully",
            data: user
        });
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ status: false, message: "Internal server error" });
    }
};

// Update user details
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, mobile, role, gender, date_of_birth, profile_picture } = req.body;

        const user = await UserModel.findById(id);
        if (!user || user.is_deleted) {
            return res.status(404).json({ status: false, message: "User not found" });
        }

        const updateData = {};
        if (name) updateData.name = name;
        if (mobile) updateData.mobile = mobile;
        if (role) updateData.role = role;
        if (gender) updateData.gender = gender;
        if (date_of_birth) updateData.date_of_birth = date_of_birth;
        
        // Handle physical file upload for profile picture
        if (req.files && req.files.profile_picture) {
            const mediaFile = req.files.profile_picture;
            const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

            if (!allowedImageTypes.includes(mediaFile.mimetype)) {
                return res.status(400).json({ status: false, message: 'Invalid image type for profile picture (Use JPEG, PNG, WEBP, or GIF)' });
            }

            const base64Media = `data:${mediaFile.mimetype};base64,${mediaFile.data.toString('base64')}`;
            
            const uploadOptions = {
                folder: `user_profiles/${id}`,
                resource_type: 'image',
                public_id: `profile_${id}_${Date.now()}`,
                transformation: [
                    { width: 500, height: 500, crop: 'limit', quality: 'auto' }
                ]
            };

            const result = await cloudinary.uploader.upload(base64Media, uploadOptions);
            updateData.profile_picture = result.secure_url;
        } else if (profile_picture) {
            // Fallback if they passed a direct string URL
            updateData.profile_picture = profile_picture;
        }

        const updatedUser = await UserModel.findByIdAndUpdate(id, updateData, { new: true }).select('-password_hash');

        res.status(200).json({
            status: true,
            message: "User updated successfully",
            data: updatedUser
        });
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ status: false, message: "Internal server error" });
    }
};

// Update user status (active/inactive)
const updateUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['active', 'inactive'].includes(status)) {
            return res.status(400).json({ status: false, message: "Invalid status value" });
        }

        const user = await UserModel.findById(id);
        if (!user || user.is_deleted) {
            return res.status(404).json({ status: false, message: "User not found" });
        }

        // Send activation email if they are being switched to 'active' for the first time
        if (status === 'active' && user.status !== 'active') {
            const emailContent = generateActivationEmailContent(user.name, user.unique_id);

            // We do not await this so it sends in the background without slowing down the API response
            sendEmail({
                to: user.email,
                subject: "Your Coaching Account is Now Active!",
                html: emailContent
            });
        }

        user.status = status;
        await user.save();

        res.status(200).json({
            status: true,
            message: `User status updated to ${status}`,
            data: { id: user._id, status: user.status }
        });
    } catch (error) {
        console.error("Error updating user status:", error);
        res.status(500).json({ status: false, message: "Internal server error" });
    }
};

// Soft delete user
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await UserModel.findById(id);
        if (!user || user.is_deleted) {
            return res.status(404).json({ status: false, message: "User not found or already deleted" });
        }

        // Soft delete by flagging is_deleted = true
        user.is_deleted = true;
        user.status = 'inactive';
        await user.save();

        res.status(200).json({
            status: true,
            message: "User deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ status: false, message: "Internal server error" });
    }
};

module.exports = {
    createUser,
    getAllUsers,
    getUserById,
    updateUser,
    updateUserStatus,
    deleteUser
};
