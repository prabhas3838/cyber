const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  encryptedMessage: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  bankSignature: String

});

module.exports = mongoose.model("Message", messageSchema);
