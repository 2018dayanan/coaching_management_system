const { User } = require("../../models");
const bcrypt = require('bcryptjs');
const cloudinary = require("../../config/cloudinary");
const { sendEmail } = require("../../services/emailManager");
const { generateActivationEmailContent } = require("../../templates/email/statusTemplate");
const catchAsync = require("../../utils/catchAsync");
const AppError = require("../../utils/appError");

// Admin create a user
exports.createUser = catchAsync(async (req, res, next) => {
    const { name, email, mobile, password, role, gender } = req.body;

    if (gender && !['male', 'female', 'other'].includes(gender.toLowerCase())) {
        return next(new AppError("Invalid gender value.", 400));
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return next(new AppError("User with this email already exists.", 400));
    }

    const password_hash = await bcrypt.hash(password || '12345678', 12);

    const currentYear = new Date().getFullYear();
    const latestUser = await User.findOne({ unique_id: new RegExp(`^STD-${currentYear}-`, 'i') }).sort({ unique_id: -1 });
    let nextSeq = 1;
    if (latestUser && latestUser.unique_id) {
        const parts = latestUser.unique_id.split('-');
        if (parts.length === 3) {
            nextSeq = parseInt(parts[2], 10) + 1;
        }
    }
    const unique_id = `STD-${currentYear}-${nextSeq.toString().padStart(4, '0')}`;

    const newUser = await User.create({
        name,
        email,
        mobile,
        password_hash,
        gender: gender ? gender.toLowerCase() : 'male',
        unique_id,
        role: role || 'student',
        status: 'active'
    });

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
});

// Get all users
exports.getAllUsers = catchAsync(async (req, res, next) => {
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

    const users = await User.find(query)
        .select('-password_hash')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    const total = await User.countDocuments(query);

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
});

// Get a single user by ID
exports.getUserById = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.params.id).select('-password_hash');

    if (!user || user.is_deleted) {
        return next(new AppError("User not found", 404));
    }

    res.status(200).json({
        status: true,
        message: "User fetched successfully",
        data: user
    });
});

// Update user details
exports.updateUser = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { name, mobile, role, gender, date_of_birth, profile_picture } = req.body;

    const user = await User.findById(id);
    if (!user || user.is_deleted) {
        return next(new AppError("User not found", 404));
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (mobile) updateData.mobile = mobile;
    if (role) updateData.role = role;
    if (gender) updateData.gender = gender;
    if (date_of_birth) updateData.date_of_birth = date_of_birth;
    
    if (req.files && req.files.profile_picture) {
        const mediaFile = req.files.profile_picture;
        const base64Media = `data:${mediaFile.mimetype};base64,${mediaFile.data.toString('base64')}`;
        
        const uploadOptions = {
            folder: `user_profiles/${id}`,
            resource_type: 'image',
            public_id: `profile_${id}_${Date.now()}`,
            transformation: [{ width: 500, height: 500, crop: 'limit', quality: 'auto' }]
        };

        const result = await cloudinary.uploader.upload(base64Media, uploadOptions);
        updateData.profile_picture = result.secure_url;
    } else if (profile_picture) {
        updateData.profile_picture = profile_picture;
    }

    const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).select('-password_hash');

    res.status(200).json({
        status: true,
        message: "User updated successfully",
        data: updatedUser
    });
});

// Update user status
exports.updateUserStatus = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'inactive'].includes(status)) {
        return next(new AppError("Invalid status value", 400));
    }

    const user = await User.findById(id);
    if (!user || user.is_deleted) {
        return next(new AppError("User not found", 404));
    }

    if (status === 'active' && user.status !== 'active') {
        const emailContent = generateActivationEmailContent(user.name, user.unique_id);
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
});

// Soft delete user
exports.deleteUser = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user || user.is_deleted) {
        return next(new AppError("User not found or already deleted", 404));
    }

    user.is_deleted = true;
    user.status = 'inactive';
    await user.save();

    res.status(200).json({
        status: true,
        message: "User deleted successfully"
    });
});
