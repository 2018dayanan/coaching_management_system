const { User, Otp } = require("../models");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendEmail } = require("../services/emailManager");
const { generateOTPTemplate } = require("../templates/email/otpTemplate");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new AppError("Email and password are required", 400));
    }

    const user = await User.findOne({ email, is_deleted: false });
    if (!user) {
        return next(new AppError("Invalid credentials", 401));
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
        return next(new AppError("Invalid credentials", 401));
    }

    if (user.status !== 'active') {
        return next(new AppError("Your account is currently inactive. Please contact admin.", 403));
    }

    const token = jwt.sign(
        {
            userId: user._id,
            email: user.email,
            role: user.role
        },
        process.env.SECRET_KEY,
        { expiresIn: '7d' }
    );

    res.status(200).json({
        status: true,
        message: "Login successful",
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            unique_id: user.unique_id,
            profile_picture: user.profile_picture
        }
    });
});

// Send OTP
exports.sendOtp = catchAsync(async (req, res, next) => {
    const { email } = req.body;

    if (!email) {
        return next(new AppError("Email is required", 400));
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    await Otp.findOneAndUpdate(
        { email },
        { otp, createdAt: Date.now() },
        { upsert: true, new: true }
    );

    const emailContent = generateOTPTemplate(otp);
    await sendEmail({
        to: email,
        subject: "Verification Code",
        html: emailContent
    });

    res.status(200).json({
        status: true,
        message: "OTP sent successfully"
    });
});

// Verify OTP
exports.verifyOtp = catchAsync(async (req, res, next) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return next(new AppError("Email and OTP are required", 400));
    }

    const otpRecord = await Otp.findOne({ email, otp });

    if (!otpRecord) {
        return next(new AppError("Invalid or expired OTP", 400));
    }

    // OTP valid for 5 minutes
    const isExpired = (Date.now() - otpRecord.createdAt) > 5 * 60 * 1000;
    if (isExpired) {
        return next(new AppError("OTP has expired", 400));
    }

    await Otp.deleteOne({ _id: otpRecord._id });

    res.status(200).json({
        status: true,
        message: "OTP verified successfully"
    });
});

// Get user profile
exports.getMyProfile = catchAsync(async (req, res, next) => {
    const user_id = req.user.userId;

    const user = await User.findById(user_id).select('-password_hash -__v -createdAt -updatedAt');

    if (!user || user.is_deleted) {
        return next(new AppError("User not found or deleted", 404));
    }

    res.status(200).json({
        status: true,
        message: "Profile fetched successfully",
        data: user
    });
});

// Update user profile
exports.updateProfile = catchAsync(async (req, res, next) => {
    const user_id = req.user.userId;
    const { name, mobile, profile_picture, gender } = req.body;

    const user = await User.findById(user_id);
    if (!user || user.is_deleted) {
        return next(new AppError("User not found", 404));
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (mobile) updateData.mobile = mobile;
    if (gender) updateData.gender = gender;

    if (req.files && req.files.profile_picture) {
        const mediaFile = req.files.profile_picture;
        const base64Media = `data:${mediaFile.mimetype};base64,${mediaFile.data.toString('base64')}`;

        const uploadOptions = {
            folder: `user_profiles/${user_id}`,
            resource_type: 'image',
            public_id: `profile_${user_id}_${Date.now()}`,
            transformation: [{ width: 500, height: 500, crop: 'limit', quality: 'auto' }]
        };

        const result = await cloudinary.uploader.upload(base64Media, uploadOptions);
        updateData.profile_picture = result.secure_url;
    } else if (profile_picture) {
        updateData.profile_picture = profile_picture;
    }

    const updatedUser = await User.findByIdAndUpdate(
        user_id,
        updateData,
        { new: true, runValidators: true }
    ).select('-password_hash -__v -createdAt -updatedAt');

    res.status(200).json({
        status: true,
        message: "Profile updated successfully",
        data: updatedUser
    });
});
