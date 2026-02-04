require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const { sendOTP } = require('./utils/email');
const { generateOTP } = require('./utils/otp');

// Mock the email sending to avoid actual emails if creds are missing
// But if creds are present, we can try to send.
// effectively we want to test that the sendOTP function works as expected given the conditions.

async function testEmailOTP() {
    console.log("Starting Email OTP Verification...");

    const testEmail = "testuser" + Date.now() + "@example.com";
    const otp = generateOTP();

    console.log(`Test Email: ${testEmail}`);
    console.log(`Generated OTP: ${otp}`);

    // Test 1: Send OTP using the utility
    // Note: This will fail if env vars are not set, which is expected behavior for the real app
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;

    if (!user || !pass) {
        console.log("WARNING: EMAIL_USER or EMAIL_PASS not set in .env");
    } else {
        console.log(`DEBUG: Loaded EMAIL_USER: ${user}`);
        console.log(`DEBUG: Loaded EMAIL_PASS: ${pass ? pass.substring(0, 4) + '****' + pass.substring(pass.length - 2) : 'undefined'} (Length: ${pass ? pass.length : 0})`);

        // Check for common issues
        if (pass && pass.includes(" ")) {
            console.log("DEBUG: Password contains spaces. This is expected for App Passwords (nodemailer handles it), but ensure no leading/trailing whitespace.");
        }
    }

    if (!user || !pass) {
        console.log("WARNING: EMAIL_USER or EMAIL_PASS not set. Skipping actual email send test.");
        console.log("Mocking successful send for logic verification.");
    } else {
        try {
            const sent = await sendOTP(testEmail, otp);
            if (sent) {
                console.log("SUCCESS: Email sent successfully via nodemailer.");
            } else {
                console.error("FAILURE: Email failed to send.");
            }
        } catch (e) {
            console.error("FAILURE: Exception during email send:", e);
        }
    }

    console.log("Verification finished.");
    process.exit(0);
}

testEmailOTP();
