const express = require("express");
const auth = require("../middleware/auth");
const access = require("../middleware/accessControl");
const Transaction = require("../models/Transaction");

const {
  decryptAESWithKey,
  decryptAESKey,
  verifySignature
} = require("../utils/encryption");

const { decodeBase64 } = require("../utils/encoding");

const router = express.Router();

// Simple admin log test
router.get("/logs", auth, access("LOGS"), (req, res) => {
  res.send("Transaction Logs Accessed");
});

// 🔐 Admin verifies & decrypts transaction
router.get(
  "/transaction/:id",
  auth,
  access("LOGS"), // ADMIN / AUDITOR
  async (req, res) => {

    // 1️⃣ Fetch transaction
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).send("Transaction not found");
    }

    // 2️⃣ Decode Base64 encrypted payload
    const decodedEncryptedData = decodeBase64(transaction.encryptedData);

    // 3️⃣ Decrypt AES key using RSA private key
    const aesKey = decryptAESKey(transaction.encryptedAESKey);

    // 4️⃣ Decrypt transaction data using decrypted AES key
    const decryptedData = decryptAESWithKey(
      decodedEncryptedData,
      aesKey
    );

    // 5️⃣ Verify digital signature
    const valid = verifySignature(decryptedData, transaction.signature);

    res.json({
      decryptedTransaction: JSON.parse(decryptedData),
      integrity: valid ? "Verified" : "Tampered"
    });
  }
);



module.exports = router;
