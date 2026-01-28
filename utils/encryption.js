const crypto = require("crypto");

// ===== GLOBAL AES (optional / legacy) =====
const AES_KEY = Buffer.from(process.env.AES_KEY, "hex");
const IV = Buffer.from(process.env.AES_IV, "hex");

// ===== RSA KEYS (demo) =====
const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
  modulusLength: 2048
});

// ===== GLOBAL AES FUNCTIONS =====
exports.encryptAES = (text) => {
  const cipher = crypto.createCipheriv("aes-256-cbc", AES_KEY, IV);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
};

exports.decryptAES = (encrypted) => {
  const decipher = crypto.createDecipheriv("aes-256-cbc", AES_KEY, IV);
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
};

// ===== PER-TRANSACTION AES (NEW & REQUIRED) =====
exports.encryptAESWithKey = (text, aesKey) => {
  const cipher = crypto.createCipheriv("aes-256-cbc", aesKey, IV);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
};

exports.decryptAESWithKey = (encrypted, aesKey) => {
  const decipher = crypto.createDecipheriv("aes-256-cbc", aesKey, IV);
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
};

// ===== DIGITAL SIGNATURE =====
exports.signData = (data) => {
  const hash = crypto.createHash("sha256").update(data).digest();
  return crypto.sign("SHA256", hash, privateKey).toString("hex");
};

exports.verifySignature = (data, signature) => {
  const hash = crypto.createHash("sha256").update(data).digest();
  return crypto.verify(
    "SHA256",
    hash,
    publicKey,
    Buffer.from(signature, "hex")
  );
};

// ===== RSA KEY EXCHANGE =====
exports.encryptAESKey = (aesKey) => {
  return crypto.publicEncrypt(publicKey, aesKey).toString("hex");
};

exports.decryptAESKey = (encryptedKey) => {
  return crypto.privateDecrypt(
    privateKey,
    Buffer.from(encryptedKey, "hex")
  );
};
