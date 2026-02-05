const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Account = require("../models/Account");
const { generateOTP } = require("../utils/otp");
const { sendOTP } = require("../utils/email");
const { encryptAES } = require("../utils/encryption");
const crypto = require("crypto");

const router = express.Router();

// Register
router.post("/register", async (req, res) => {
  const hash = await bcrypt.hash(req.body.password, 10);
  const hashedPin = await bcrypt.hash(req.body.txnPin, 10);

  const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048
  });

  const user = await User.create({
    username: req.body.username,
    email: req.body.email,
    password: hash,
    role: req.body.role || "CUSTOMER",
    txnPin: hashedPin,
    publicKey: publicKey.export({ type: "pkcs1", format: "pem" }),
    privateKey: encryptAES(privateKey.export({ type: "pkcs1", format: "pem" }))
  });
  await Account.create({ userId: user._id, balance: 1000 });
  res.send("User Registered");
});

// Login + OTP
router.post("/login", async (req, res) => {
  const user = await User.findOne({ username: req.body.username });
  if (!user) return res.send("User not found");

  const valid = await bcrypt.compare(req.body.password, user.password);
  if (!valid) return res.send("Invalid password");

  const otp = generateOTP();
  user.otp = otp;
  await user.save();

  if (user.email) {
    await sendOTP(user.email, otp);
    res.send("OTP Sent to Email");
  } else {
    console.log("OTP:", otp); // Fallback for legacy users
    res.send("OTP Sent (Console)");
  }
});

// Verify OTP
router.post("/verify-otp", async (req, res) => {
  const user = await User.findOne({ otp: req.body.otp });
  if (!user) return res.send("Invalid OTP");

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET
  );

  user.otp = null;
  await user.save();

  res.json({ token });
});

module.exports = router;
