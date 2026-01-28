const crypto = require("crypto");

// Encrypt using USER'S public key
exports.encryptMessage = (message, publicKey) => {
  return crypto.publicEncrypt(
    publicKey,
    Buffer.from(message)
  ).toString("hex");
};

// Decrypt using USER'S private key
exports.decryptMessage = (encrypted, privateKey) => {
  return crypto.privateDecrypt(
    privateKey,
    Buffer.from(encrypted, "hex")
  ).toString("utf8");
};
