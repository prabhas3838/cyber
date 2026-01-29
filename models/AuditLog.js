const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  role: String,

  action: {
    type: String,
    required: true
  },

  details: Object,   // flexible metadata
  ipAddress: String,

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("AuditLog", auditLogSchema);
