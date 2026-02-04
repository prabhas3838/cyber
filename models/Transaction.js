const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  from: mongoose.Schema.Types.ObjectId,
  to: mongoose.Schema.Types.ObjectId,

  amount: Number,
  encryptedData: String,
  encryptedAESKey: String,
  signature: String,
  status: {
    type: String,
    enum: ["INITIATED", "APPROVED", "SUCCESS", "FAILED", "REVERSED"],
    default: "INITIATED"
  },
}, { timestamps: true });

module.exports = mongoose.model("Transaction", transactionSchema);
