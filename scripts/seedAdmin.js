require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const AdminModel = require('../models/admin_model');

const seedAdmins = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log('Connected to database for seeding admins...');

        const existingSuperAdmin = await AdminModel.findOne({ role: 'SUPER_ADMIN' });
        if (existingSuperAdmin) {
            console.log('Super admin already exists. Skipping seeding...');
            process.exit(0);
        }

        const adminsData = [
            {
                name: 'Super Admin',
                username: 'superadmin',
                email: 'superadmin@gmail.com',
                phone: 1234567890,
                password: '12345678',
                role: 'SUPER_ADMIN'
            },
            {
                name: 'Admin User',
                username: 'admin',
                email: 'admin@gmail.com',
                phone: 9876543210,
                password: '12345678',
                role: 'ADMIN'
            }
        ];

        for (const adminData of adminsData) {
            const hashedPassword = await bcrypt.hash(adminData.password, 12);

            const newAdmin = new AdminModel({
                ...adminData,
                password: hashedPassword
            });

            await newAdmin.save();
            console.log(`Admin created: ${adminData.name} (${adminData.role})`);
        }

        console.log('Admin seeding completed successfully!');
        process.exit(0);

    } catch (error) {
        console.error('Error seeding admins:', error);
        process.exit(1);
    }
};

seedAdmins();
