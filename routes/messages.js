const express = require("express");
const auth = require("../middleware/auth");
const Message = require("../models/Message");
const User = require("../models/User");
const { decryptMessage } = require("../utils/messageCrypto");
const { verifySignature, decryptAES } = require("../utils/encryption");

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

    // 3️⃣ Decrypt + verify EACH message
    const decryptedMessages = messages.map(msg => {
      // Unlock Private Key
      let privateKey = user.privateKey;
      if (!privateKey.includes("-----BEGIN")) {
        try {
          privateKey = decryptAES(privateKey);
        } catch (e) {
          console.error("Private Key Decryption Failed", e);
          return { message: "Error: Could not unlock private key", verified: "Error", date: msg.createdAt };
        }
      }

      try {
        const decryptedText = decryptMessage(
          msg.encryptedMessage,
          privateKey
        );

        let verified = "Unknown";

        if (msg.bankSignature) {
          const isValid = verifySignature(
            decryptedText,
            msg.bankSignature
          );
          verified = isValid ? "From Bank" : "Tampered";
        } else {
          verified = "Unsigned (Legacy Message)";
        }



        return {
          message: decryptedText,
          verified,
          date: msg.createdAt
        };
      } catch (err) {
        return { message: "Decryption Failed", verified: "Error", date: msg.createdAt };
      }
    });

    res.json(decryptedMessages);
  } catch (err) {
    console.error("Inbox error:", err);
    res.status(500).send("Failed to fetch secure messages");
  }
});

module.exports = router;
