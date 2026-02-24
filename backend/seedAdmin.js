const mongoose = require('mongoose');
const dotenv = require('dotenv').config();
const User = require('./models/User');
const connectDB = require('./config/db');

// Connect to DB
connectDB();

const seedAdmin = async () => {
    try {
        const adminEmail = 'admin@felicity.iiit.ac.in';
        const adminPassword = 'password'; // Change this in production!

        // Check if admin exists
        const adminExists = await User.findOne({ email: adminEmail });

        if (adminExists) {
            console.log('Admin user already exists');
            process.exit();
        }

        // Create Admin
        const admin = await User.create({
            name: 'Super Admin',
            email: adminEmail,
            password: adminPassword, // Model pre-save hook will hash this
            role: 'admin'
        });

        console.log('Admin created successfully');
        console.log(`Email: ${adminEmail}`);
        console.log(`Password: ${adminPassword}`);
        process.exit();

    } catch (error) {
        console.error('Error seeding admin:', error);
        process.exit(1);
    }
};

seedAdmin();
