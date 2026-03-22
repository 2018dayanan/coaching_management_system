const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const AdminModel = require('../../../models/admin_model');

const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        const admin = await AdminModel.findOne({ email });
        if (!admin) {
            return res.status(401).json({
                status: false,
                message: "Invalid credentials"
            });
        }

        const isPasswordValid = await bcrypt.compare(password, admin.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                status: false,
                message: "Invalid credentials"
            });
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

    } catch (error) {
        console.error("Error during admin login:", error);
        return res.status(500).json({
            status: false,
            message: "Internal server error"
        });
    }
};

module.exports = {
    adminLogin
};