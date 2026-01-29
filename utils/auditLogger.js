const AuditLog = require("../models/AuditLog");

exports.logAudit = async (req, action, details = {}) => {
  try {
    await AuditLog.create({
      userId: req.user?.id || null,
      role: req.user?.role || "SYSTEM",
      action,
      details,
      ipAddress: req.ip
    });
  } catch (err) {
    console.error("Audit log failed:", err.message);
  }
};
