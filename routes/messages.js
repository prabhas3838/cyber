const express = require("express");
const auth = require("../middleware/auth");
const Message = require("../models/Message");
const User = require("../models/User");
const { decryptMessage } = require("../utils/messageCrypto");

const router = express.Router();

router.get("/inbox", auth, async (req, res) => {
  try {
    // 1️⃣ Get logged-in user
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).send("User not found");
    }

    // 2️⃣ Fetch encrypted messages
    const messages = await Message.find({ userId: req.user.id });

    // 3️⃣ Decrypt using user's PRIVATE KEY
    const decryptedMessages = messages.map(msg => ({
      message: decryptMessage(msg.encryptedMessage, user.privateKey),
      date: msg.createdAt
    }));

    res.json(decryptedMessages);
  } catch (err) {
    console.error("Inbox error:", err);
    res.status(500).send("Failed to fetch secure messages");
  }
});

module.exports = router;
