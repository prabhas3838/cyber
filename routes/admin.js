const express = require("express");
const auth = require("../middleware/auth");
const access = require("../middleware/accessControl");
const Transaction = require("../models/Transaction");
const Account = require("../models/Account");
const User=require("../models/User");
const { logAudit } = require("../utils/auditLogger");



const {
  decryptAESWithKey,
  decryptAESKey,
  verifySignature,
  signData
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

router.post(
  "/freeze-account/:userId",
  auth,
  access("FREEZE"),
  async (req, res) => {
    const account = await Account.findOne({ userId: req.params.userId });
    if (!account) return res.status(404).send("Account not found");

    account.isFrozen = true;
    await account.save();

    res.send("Account frozen successfully");
  }
);

router.post(
  "/unfreeze-account/:userId",
  auth,
  access("FREEZE"),
  async (req, res) => {
    const account = await Account.findOne({ userId: req.params.userId });
    if (!account) return res.status(404).send("Account not found");

    account.isFrozen = false;
    await account.save();

    res.send("Account unfrozen successfully");
  }
);

router.post(
  "/approve-transaction/:id",
  auth,
  access("APPROVE"),
  async (req, res) => {

    // 1️⃣ Fetch transaction
    const tx = await Transaction.findById(req.params.id);
    if (!tx) return res.status(404).send("Transaction not found");

    // 2️⃣ Only INITIATED transactions can be approved
    if (tx.status !== "INITIATED") {
      return res.status(400).send("Transaction not eligible for approval");
    }

    // 3️⃣ Fetch accounts
    const senderAccount = await Account.findOne({ userId: tx.from });
    const receiverAccount = await Account.findOne({ userId: tx.to });

    if (!senderAccount || !receiverAccount) {
      return res.status(404).send("Account not found");
    }

    // 4️⃣ Final balance check (IMPORTANT)
    if (senderAccount.balance < tx.amount) {
      tx.status = "FAILED";
      await tx.save();
      return res.send("Transaction failed due to insufficient balance");
    }

    // 🔥 5️⃣ DEDUCT MONEY HERE
    senderAccount.balance -= tx.amount;
    receiverAccount.balance += tx.amount;

    // 6️⃣ Update status
    tx.status = "SUCCESS";

    await logAudit(req, "TRANSACTION_APPROVED", {
      transactionId: tx._id,
      amount: tx.amount
    });
    

    await senderAccount.save();
    await receiverAccount.save();
    await tx.save();

    res.send("Transaction approved and amount transferred successfully");
  }
);


router.post(
  "/reject-transaction/:id",
  auth,
  access("APPROVE"),
  async (req, res) => {

    const tx = await Transaction.findById(req.params.id);
    if (!tx || tx.status !== "INITIATED") {
      return res.status(400).send("Invalid transaction");
    }

    tx.status = "FAILED";
    await tx.save();

    await logAudit(req, "TRANSACTION_REJECTED", {
      transactionId: tx._id
    });
    

    res.send("Transaction rejected");
  }
);


const Message = require("../models/Message");
const { encryptMessage } = require("../utils/messageCrypto");

router.post(
  "/notify/:userId",
  auth,
  access("LOGS"), // ADMIN
  async (req, res) => {

    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).send("User not found");
    const bankSignature = signData(req.body.message);

    

    const encryptedMsg = encryptMessage(
      req.body.message,
      user.publicKey
    );

    await Message.create({
      userId: user._id,
      encryptedMessage: encryptedMsg,
      bankSignature
    });

    res.send("Secure notification sent");
  }
);


const AuditLog = require("../models/AuditLog");

router.get(
  "/audit-logs",
  auth,
  access("LOGS"),
  async (req, res) => {

    const logs = await AuditLog.find()
      .sort({ createdAt: -1 })
      .limit(100);

    res.json(logs);
  }
);




module.exports = router;
