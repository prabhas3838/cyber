const express = require("express");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { logAudit } = require("../utils/auditLogger");


const Account = require("../models/Account");
const Transaction = require("../models/Transaction");
const User = require("../models/User");

const auth = require("../middleware/auth");
const access = require("../middleware/accessControl");

const {
  encryptAESWithKey,
  encryptAESKey,
  signData,
  decryptAES
} = require("../utils/encryption");


const { encodeBase64 } = require("../utils/encoding");

const router = express.Router();
const APPROVAL_LIMIT = 25; // or 20000




// View balance
router.get("/balance", auth, access("VIEW"), async (req, res) => {
  const account = await Account.findOne({ userId: req.user.id });
  res.json(account);
});

// Transfer money (WITH TRANSACTION PIN + HYBRID ENCRYPTION)
router.post("/transfer", auth, access("TRANSFER"), async (req, res) => {
  const { to, amount, txnPin } = req.body;

  // 🔐 Verify Transaction PIN
  const user = await User.findById(req.user.id);
  const pinValid = await bcrypt.compare(txnPin, user.txnPin);
  if (!pinValid) {
    return res.status(401).send("Invalid Transaction PIN");
  }

  // 1️⃣ Get sender & receiver accounts
  const senderAccount = await Account.findOne({ userId: req.user.id });
  const receiverAccount = await Account.findOne({ userId: to });



  if (!senderAccount || !receiverAccount) {
    return res.status(404).send("Account not found");
  }

  // Check if sender account is frozen
  if (senderAccount.isFrozen) {
    return res.status(403).send("Your account is frozen. Contact bank admin.");
  }

  // Check if receiver account is frozen
  if (receiverAccount.isFrozen) {
    return res.status(403).send("Receiver account is frozen.");
  }


  // 2️⃣ Check balance
  if (senderAccount.balance < amount) {
    return res.status(400).send("Insufficient balance");
  }

  // 3️⃣ Create transaction payload
  const data = JSON.stringify({
    from: req.user.id,
    to,
    amount
  });

  // 🔑 4️⃣ Generate AES key PER TRANSACTION
  const aesKey = crypto.randomBytes(32);

  // 🔐 5️⃣ Encrypt data using AES
  const encryptedData = encryptAESWithKey(data, aesKey);
  const encodedData = encodeBase64(encryptedData);

  // 🔐 6️⃣ Encrypt AES key using RSA
  const encryptedAESKey = encryptAESKey(aesKey);

  // ✍️ 7️⃣ Digital signature (Signed by User)
  let signingKey = user.privateKey;

  // Try to decrypt if it doesn't look like a PEM (which starts with -----BEGIN)
  if (!signingKey.includes("-----BEGIN")) {
    try {
      signingKey = decryptAES(signingKey);
    } catch (err) {
      console.error("Failed to decrypt private key, assuming legacy plaintext or corruption", err);
    }
  }

  const signature = signData(data, signingKey);

  let status = "SUCCESS";

  if (amount > APPROVAL_LIMIT) {
    status = "INITIATED"; // waiting for admin approval
  }

  // 💾 8️⃣ Save transaction
  const tx = await Transaction.create({
    from: req.user.id,
    to,
    amount,
    encryptedData: encodedData,
    encryptedAESKey,
    signature,
    status
  });

  await logAudit(req, "TRANSFER_INITIATED", {
    transactionId: tx._id.toString(),
    to,
    amount
  });

  if (status === "INITIATED") {
    console.log("📝 Logging PENDING_APPROVAL for TX:", tx._id.toString());
    await logAudit(req, "TRANSFER_PENDING_APPROVAL", {
      transactionId: tx._id.toString(),
      amount
    });
  }


  if (status === "SUCCESS") {

    await logAudit(req, "TRANSFER_SUCCESS", {
      transactionId: tx._id.toString(),
      amount
    });

    senderAccount.balance -= amount;
    receiverAccount.balance += amount;

    await senderAccount.save();
    await receiverAccount.save();

    return res.send("Transaction successful");
  }

  return res.send("Transaction initiated and pending admin approval");

});

// View user's own transaction history
router.get("/history", auth, async (req, res) => {
  const userId = req.user.id;

  const transactions = await Transaction.find({
    $or: [{ from: userId }, { to: userId }]
  }).sort({ createdAt: -1 });

  const result = transactions.map(tx => ({
    id: tx._id,
    type: tx.from.toString() === userId ? "DEBIT" : "CREDIT",
    amount: tx.amount,
    date: tx.createdAt || tx._id.getTimestamp(),
    status: tx.status
  }));

  res.json(result);
});

module.exports = router;
