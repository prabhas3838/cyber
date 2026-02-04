require("dotenv").config();
const {
    encryptAESWithKey,
    decryptAESWithKey,
    encryptAESKey,
    decryptAESKey,
    signData,
    verifySignature,
    encryptAES, // legacy
    decryptAES  // legacy
} = require("./utils/encryption");
const crypto = require("crypto");
const { encodeBase64, decodeBase64 } = require("./utils/encoding");

const testSystem = () => {
    try {
        console.log("🚀 Starting System Verification...");

        // 1. Data
        const originalData = JSON.stringify({ from: "Alice", to: "Bob", amount: 100 });
        console.log("📝 Original Data:", originalData);

        // 2. Transacton Logic imitation
        const aesKey = crypto.randomBytes(32);

        // Encrypt Data
        const encryptedData = encryptAESWithKey(originalData, aesKey);
        const encodedData = encodeBase64(encryptedData);
        console.log("🔒 Encrypted Data (Base64):", encodedData.substring(0, 20) + "...");

        // Encrypt Key
        const encryptedAESKey = encryptAESKey(aesKey);
        console.log("🔑 Encrypted AES Key length:", encryptedAESKey.length);

        // Sign
        const signature = signData(originalData);
        console.log("✍️  Signature generated");

        // --- VERIFICATION SIDE ---

        // 1. Decrypt AES Key
        const decryptedAESKey = decryptAESKey(encryptedAESKey);
        if (decryptedAESKey.equals(aesKey)) {
            console.log("✅ AES Key Decryption Successful");
        } else {
            console.error("❌ AES Key Decryption FAILED");
            process.exit(1);
        }

        // 2. Decrypt Data
        const decodedEncrypted = decodeBase64(encodedData);
        const decryptedData = decryptAESWithKey(decodedEncrypted, decryptedAESKey);

        if (decryptedData === originalData) {
            console.log("✅ Data Decryption Successful");
        } else {
            console.error("❌ Data Decryption FAILED");
            console.log("Expected:", originalData);
            console.log("Got:", decryptedData);
            process.exit(1);
        }

        // 3. Verify Signature
        const isValid = verifySignature(decryptedData, signature);
        if (isValid) {
            console.log("✅ Signature Verification Successful");
        } else {
            console.error("❌ Signature Verification FAILED");
            process.exit(1);
        }

        console.log("🎉 SYSTEM INTEGRITY VERIFIED");

    } catch (err) {
        console.error("❌ System verification failed:", err);
    }
};

testSystem();
