require("dotenv").config();
const mongoose = require("mongoose");
const Transaction = require("./models/Transaction");

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/secure-banking");
        console.log("MongoDB Connected");
    } catch (err) {
        console.error("DB Connection Error:", err.message);
        process.exit(1);
    }
};

const checkTransaction = async () => {
    await connectDB();
    const id = process.argv[2];

    if (!id) {
        console.log("Usage: node check_tx.js <transaction_id>");
        process.exit(1);
    }

    try {
        console.log(`Checking Transaction ID: ${id}`);
        const tx = await Transaction.findById(id);

        if (!tx) {
            console.log("❌ Transaction NOT FOUND in database.");
        } else {
            console.log("✅ Transaction FOUND:");
            console.log(JSON.stringify(tx, null, 2));
            console.log("--- Field Check ---");
            console.log("encryptedData present:", !!tx.encryptedData);
            console.log("encryptedAESKey present:", !!tx.encryptedAESKey);
            console.log("signature present:", !!tx.signature);
        }
    } catch (err) {
        console.error("❌ Error querying transaction:", err);
    } finally {
        mongoose.connection.close();
    }
};

checkTransaction();
