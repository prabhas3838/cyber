const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  balance: Number,
});

module.exports = mongoose.model("Account", accountSchema);
