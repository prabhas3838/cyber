const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  from: mongoose.Schema.Types.ObjectId,
  to: mongoose.Schema.Types.ObjectId,
 
  amount: Number,
  encryptedData: String,
  encryptedAESKey: String,
  signature: String
});

module.exports = mongoose.model("Transaction", transactionSchema);
