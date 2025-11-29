/**
 * Debug script to check all carts and their userId/sessionId status
 */

const mongoose = require("mongoose");
require("dotenv").config();

async function debugCarts() {
    try {
        const mongoUri =
            process.env.MONGO_URI || "mongodb://localhost:27017/milkybloom";
        await mongoose.connect(mongoUri);
        console.log("✅ Connected to MongoDB");

        const db = mongoose.connection.db;
        const cartsCollection = db.collection("carts");

        const allCarts = await cartsCollection.find({}).toArray();

        console.log(`\n📊 Total carts: ${allCarts.length}\n`);

        allCarts.forEach((cart, index) => {
            console.log(`Cart ${index + 1}:`);
            console.log(`  _id: ${cart._id}`);
            console.log(`  userId: ${cart.userId || "null"}`);
            console.log(`  sessionId: ${cart.sessionId || "null"}`);
            console.log(`  items: ${cart.items?.length || 0}`);
            console.log("");
        });

        const stats = {
            total: allCarts.length,
            hasUserId: allCarts.filter((c) => c.userId != null).length,
            hasSessionId: allCarts.filter((c) => c.sessionId != null).length,
            hasNeither: allCarts.filter(
                (c) => c.userId == null && c.sessionId == null,
            ).length,
            nullSessionIdWithUserId: allCarts.filter(
                (c) => c.userId != null && c.sessionId == null,
            ).length,
        };

        console.log("\n📊 Statistics:");
        console.log(`  Total carts: ${stats.total}`);
        console.log(`  With userId: ${stats.hasUserId}`);
        console.log(`  With sessionId: ${stats.hasSessionId}`);
        console.log(`  Neither (need fixing): ${stats.hasNeither}`);
        console.log(
            `  User carts with null sessionId (OK): ${stats.nullSessionIdWithUserId}`,
        );

        await mongoose.disconnect();
        console.log("\n✅ Disconnected from MongoDB");
    } catch (error) {
        console.error("\n❌ Error:", error);
        process.exit(1);
    }
}

debugCarts();
