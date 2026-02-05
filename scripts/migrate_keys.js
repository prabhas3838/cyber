const mongoose = require('mongoose');
const User = require('../models/User');
const { encryptAES } = require('../utils/encryption');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const migrateKeys = async () => {
    try {
        // 1. Connect to DB
        const dbUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/secure-banking';
        await mongoose.connect(dbUri, {});
        console.log("Connected to MongoDB");

        // 2. Fetch all users
        const users = await User.find({});
        console.log(`Found ${users.length} users to check.`);

        let migratedCount = 0;

        for (const user of users) {
            if (user.privateKey && user.privateKey.startsWith("-----BEGIN")) {
                console.log(`Migrating user: ${user.username}`);

                // Encrypt the plain key
                const encryptedKey = encryptAES(user.privateKey);
                user.privateKey = encryptedKey;

                await user.save();
                migratedCount++;
            }
        }

        console.log(`Migration Complete. Encrypted ${migratedCount} keys.`);
        process.exit(0);

    } catch (err) {
        console.error("Migration Failed:", err);
        process.exit(1);
    }
};

migrateKeys();
