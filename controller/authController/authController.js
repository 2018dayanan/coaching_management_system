const UserModel = require("../../models/user_model");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendEmail } = require("../../services/emailManager");
const generateOtpEmailContent = require("../../templates/email/otpTemplate");
const { Otp } = require("../../models");

const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

const register = async (req, res) => {
    try {
        const { name, email, mobile, password, gender } = req.body;

        if (gender && !['male', 'female', 'other'].includes(gender.toLowerCase())) {
            return res.status(400).json({
                status: false,
                message: "Invalid gender value. Must be 'male', 'female', or 'other'."
            });
        }

        const existingUser = await UserModel.findOne({ email });

        if (existingUser) {
            if (existingUser.status === 'inactive') {
                const pendingOtp = await Otp.findOne({
                    identifier: email,
                    type: 'email_verification',
                    isVerified: false,
                    expiresAt: { $gt: new Date() }
                });

                if (pendingOtp) {
                    return res.status(400).json({
                        status: false,
                        message: "A verification email has already been sent. Please check your email or wait for OTP to expire."
                    });
                }

                const otp = generateOTP();
                const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

                await new Otp({
                    identifier: email,
                    type: 'email_verification',
                    otp,
                    userId: existingUser._id,
                    expiresAt: otpExpiry
                }).save();

                const emailContent = generateOtpEmailContent(otp, existingUser.name);
                sendEmail({
                    to: email,
                    subject: `Email Verification code ${otp}`,
                    html: emailContent
                }).catch(error => {
                    console.error("Email sending error:", error);
                });

                return res.status(200).json({
                    status: true,
                    message: "A new verification email has been sent. Please check your email.",
                });
            }

            return res.status(400).json({
                status: false,
                message: "User with this email already exists and is active."
            });
        }

        const password_hash = await bcrypt.hash(password, 12);

        const currentYear = new Date().getFullYear();
        const latestUser = await UserModel.findOne({ unique_id: new RegExp(`^STD-${currentYear}-`, 'i') }).sort({ createdAt: -1 });
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
            status: 'inactive'
        });

        await newUser.save();

        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

        await new Otp({
            identifier: email,
            type: 'email_verification',
            otp,
            userId: newUser._id,
            expiresAt: otpExpiry
        }).save();

        const emailContent = generateOtpEmailContent(otp, name);
        sendEmail({
            to: email,
            subject: 'Email Verification',
            html: emailContent
        }).then(emailSent => {
            if (!emailSent) {
                console.log("Failed to send verification email to:", email);
            } else {
                console.log("Verification email sent to:", email);
            }
        }).catch(error => {
            console.error("Email sending error:", error);
        });

        res.status(201).json({
            status: true,
            message: "Registration successful. Please check your email for verification OTP.",
        });

    } catch (error) {
        console.error("Error registering user:", error);
        return res.status(500).json({
            status: false,
            message: "Internal server error",
        });
    }
};

const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        // Find valid OTP
        const otpRecord = await Otp.findOne({
            identifier: email,
            type: 'email_verification',
            otp,
            isVerified: false,
            expiresAt: { $gt: new Date() }
        });

        if (!otpRecord) {
            return res.status(400).json({
                status: false,
                message: "Invalid or expired OTP"
            });
        }

        // Mark OTP as verified
        otpRecord.isVerified = true;
        await otpRecord.save();

        if (!otpRecord.userId) {
            return res.status(400).json({
                status: false,
                message: "User not found for this OTP"
            });
        }

        await UserModel.findByIdAndUpdate(otpRecord.userId, {
            status: 'active',
        });

        res.status(200).json({
            status: true,
            message: "Email verified successfully"
        });

    } catch (error) {
        console.error("Error verifying OTP:", error);
        return res.status(500).json({
            status: false,
            message: "Internal server error"
        });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await UserModel.findOne({ email });
        if (!user || user.is_deleted) {
            return res.status(401).json({
                status: false,
                message: "Invalid credentials or account deleted"
            });
        }

        // Check if email is verified
        if (user.status === 'inactive') {
            return res.status(401).json({
                status: false,
                message: "Please verify your email before logging in. Check your inbox for the verification OTP."
            });
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
            return res.status(401).json({
                status: false,
                message: "Invalid credentials"
            });
        }

        // Update last_login
        user.last_login = new Date();
        await user.save();

        // Generate JWT token
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
                mobile: user.mobile,
                role: user.role,
                profile_picture: user.profile_picture
            }
        });

    } catch (error) {
        console.error("Error during login:", error);
        return res.status(500).json({
            status: false,
            message: "Internal server error"
        });
    }
};

const resendOtp = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(404).json({
                status: false,
                message: "User not found"
            });
        }

        // Check if user is already verified
        if (user.status === 'active') {
            return res.status(400).json({
                status: false,
                message: "User is already verified and active"
            });
        }

        // Check if there's an active (non-expired) OTP
        const activeOtp = await Otp.findOne({
            identifier: email,
            type: 'email_verification',
            isVerified: false,
            expiresAt: { $gt: new Date() }
        });

        if (activeOtp) {
            return res.status(400).json({
                status: false,
                message: "An OTP was recently sent. Please check your email or wait for the current OTP to expire."
            });
        }

        // Generate new OTP
        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        await new Otp({
            identifier: email,
            type: 'email_verification',
            otp,
            userId: user._id,
            expiresAt: otpExpiry
        }).save();

        // Send OTP email
        const emailContent = generateOtpEmailContent(otp, user.name);
        sendEmail({
            to: email,
            subject: `Email Verification ${otp}`,
            html: emailContent
        }).then(emailSent => {
            if (!emailSent) {
                console.log("Failed to send verification email to:", email);
            } else {
                console.log("Verification email resent to:", email);
            }
        }).catch(error => {
            console.error("Email sending error:", error);
        });

        res.status(200).json({
            status: true,
            message: "Verification email sent successfully. Please check your email."
        });

    } catch (error) {
        console.error("Error resending OTP:", error);
        return res.status(500).json({
            status: false,
            message: "Internal server error"
        });
    }
};

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await UserModel.findOne({ email });
        if (!user || user.is_deleted) {
            return res.status(404).json({
                status: false,
                message: "User not found with this email"
            });
        }

        // Check if there's an active password reset OTP
        const activeOtp = await Otp.findOne({
            identifier: email,
            type: 'password_reset',
            isVerified: false,
            expiresAt: { $gt: new Date() }
        });

        if (activeOtp) {
            return res.status(400).json({
                status: false,
                message: "A password reset OTP was recently sent. Please check your email."
            });
        }

        // Generate OTP for password reset
        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        await new Otp({
            identifier: email,
            type: 'password_reset',
            otp,
            userId: user._id,
            expiresAt: otpExpiry
        }).save();

        // Send OTP email
        const emailContent = generateOtpEmailContent(otp, user.name);
        sendEmail({
            to: email,
            subject: 'Password Reset',
            html: emailContent
        }).then(emailSent => {
            if (!emailSent) {
                console.log("Failed to send password reset email to:", email);
            } else {
                console.log("Password reset email sent to:", email);
            }
        }).catch(error => {
            console.error("Email sending error:", error);
        });

        res.status(200).json({
            status: true,
            message: "Password reset OTP sent to your email. Please check your inbox."
        });

    } catch (error) {
        console.error("Error in forgot password:", error);
        return res.status(500).json({
            status: false,
            message: "Internal server error"
        });
    }
};

const verifyForgotPasswordOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const otpRecord = await Otp.findOne({
            identifier: email,
            type: 'password_reset',
            otp,
            isVerified: false,
            expiresAt: { $gt: new Date() }
        });

        if (!otpRecord) {
            return res.status(400).json({
                status: false,
                message: "Invalid or expired OTP"
            });
        }

        // Mark OTP as verified
        otpRecord.isVerified = true;
        await otpRecord.save();

        res.status(200).json({
            status: true,
            message: "OTP verified successfully. You can now reset your password.",
            userId: otpRecord.userId
        });

    } catch (error) {
        console.error("Error verifying forgot password OTP:", error);
        return res.status(500).json({
            status: false,
            message: "Internal server error"
        });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        // Verify OTP was verified for password reset
        const verifiedOtp = await Otp.findOne({
            identifier: email,
            type: 'password_reset',
            otp,
            isVerified: true,
            expiresAt: { $gt: new Date() }
        });

        if (!verifiedOtp) {
            return res.status(400).json({
                status: false,
                message: "OTP not verified or expired. Please request password reset again."
            });
        }

        // Hash new password
        const password_hash = await bcrypt.hash(newPassword, 12);

        // Update user password
        await UserModel.findByIdAndUpdate(verifiedOtp.userId, {
            password_hash,
        });

        // Delete the OTP record
        await Otp.findByIdAndDelete(verifiedOtp._id);

        res.status(200).json({
            status: true,
            message: "Password reset successful. You can now login with your new password."
        });

    } catch (error) {
        console.error("Error resetting password:", error);
        return res.status(500).json({
            status: false,
            message: "Internal server error"
        });
    }
};

const getMyProfile = async (req, res) => {
    try {
        const user = await UserModel.findById(req.userInfo.userId)
            .select('-password_hash -__v -createdAt -updatedAt');

        if (!user || user.is_deleted) {
            return res.status(404).json({
                status: false,
                message: "User not found or deleted"
            });
        }

        res.status(200).json({
            message: "Profile fetched successfully",
            status: true,
            user
        });

    } catch (error) {
        console.error("Error getting profile:", error);
        return res.status(500).json({
            status: false,
            message: "Internal server error"
        });
    }
};

const updateProfile = async (req, res) => {
    try {
        const { name, email, mobile, profile_picture } = req.body;
        const userId = req.userInfo.userId;

        if (email) {
            const existingUser = await UserModel.findOne({
                email,
                _id: { $ne: userId }
            });
            if (existingUser) {
                return res.status(400).json({
                    status: false,
                    message: "Email is already taken"
                });
            }
        }

        const updateData = {};
        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (mobile) updateData.mobile = mobile;
        if (profile_picture) updateData.profile_picture = profile_picture;

        const updatedUser = await UserModel.findByIdAndUpdate(
            userId,
            updateData,
            { new: true }
        ).select('-password_hash -__v -createdAt -updatedAt');

        res.status(200).json({
            status: true,
            message: "Profile updated successfully",
            user: updatedUser
        });

    } catch (error) {
        console.error("Error updating profile:", error);
        return res.status(500).json({
            status: false,
            message: "Internal server error"
        });
    }
};

module.exports = {
    register,
    verifyOtp,
    login,
    resendOtp,
    forgotPassword,
    verifyForgotPasswordOtp,
    resetPassword,
    getMyProfile,
    updateProfile
};