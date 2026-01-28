const ACL = {
    CUSTOMER: ["VIEW", "TRANSFER"],
    ADMIN: ["APPROVE", "FREEZE","LOGS"],
    AUDITOR: ["LOGS"]
  };
  
  module.exports = (permission) => {
    return (req, res, next) => {
      console.log("ROLE FROM TOKEN 👉", req.user.role);
      console.log("REQUIRED PERMISSION 👉", permission);

      if (!ACL[req.user.role].includes(permission))
        return res.status(403).send("Access Denied");
      next();
    };
  };
  