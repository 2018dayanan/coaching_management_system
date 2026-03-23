const { Admin } = require("../../models");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const catchAsync = require("../../utils/catchAsync");
const AppError = require("../../utils/appError");

exports.adminLogin = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) {
        return next(new AppError("Invalid credentials", 401));
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
        return next(new AppError("Invalid credentials", 401));
    }

    const token = jwt.sign(
        {
            adminId: admin._id,
            email: admin.email,
            role: admin.role
        },
        process.env.SECRET_KEY,
        { expiresIn: '7d' }
    );

    res.status(200).json({
        status: true,
        message: "Admin login successful",
        token,
        admin: {
            id: admin._id,
            name: admin.name,
            username: admin.username,
            email: admin.email,
            role: admin.role
        }
    });
});
