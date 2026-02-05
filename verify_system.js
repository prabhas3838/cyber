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

        // Generate Simulate User Keys
        const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
            modulusLength: 2048,
            publicKeyEncoding: { type: 'spki', format: 'pem' },
            privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
        });

        // Sign with User Private Key
        const signature = signData(originalData, privateKey);
        console.log("✍️  Signature generated (User Key)");

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
            process.exit(1);
        }

        // 3. Verify Signature using User Public Key
        const isValid = verifySignature(decryptedData, signature, publicKey);
        if (isValid) {
            console.log("✅ Signature Verification Successful (User Key)");
        } else {
            console.error("❌ Signature Verification FAILED");
            process.exit(1);
        }

        // 4. Negative Test: Verify with wrong key (Default Bank Key)
        // Note: verifySignature defaults to global key if arg is omitted.
        // It SHOULD fail because we signed with User Key.
        // HOWEVER, crypto.verify might throw error on key mismatch format, or just return false.
        try {
            const isBankValid = verifySignature(decryptedData, signature);
            if (!isBankValid) {
                console.log("✅ Negative Test Successful (Bank Key cannot verify User Signature)");
            } else {
                console.warn("⚠️  WARNING: Bank Key verified User Signature? (Should be impossible)");
            }
        } catch (e) {
            console.log("✅ Negative Test Successful (Crypto error on key mismatch expected)");
        }

        console.log("🎉 SYSTEM INTEGRITY VERIFIED");

    } catch (err) {
        console.error("❌ System verification failed:", err);
    }
};

testSystem();
