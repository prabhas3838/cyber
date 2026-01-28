const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  txnPin: String,
  role: {
    type: String,
    enum: ["CUSTOMER", "ADMIN", "AUDITOR"],
    default: "CUSTOMER"
  },
  otp: String
});

module.exports = mongoose.model("User", userSchema);
