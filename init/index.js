const mongoose = require("mongoose");
const initData = require("./data.js");
const List = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

async function main() {
    try {
        await mongoose.connect(MONGO_URL);
        console.log("✅ Connected to DB");

        await initDB();

    } catch (err) {
        console.error("❌ Error:", err);
    } finally {
        await mongoose.connection.close();
        console.log("🔒 Connection closed");
    }
}

const initDB = async() => {
    await List.deleteMany({});
    const listings = initData.data.map((obj) => ({
        ...obj,
        owner: new mongoose.Types.ObjectId("69593fd4f46edc80e4fbbe94") // valid ObjectId
    }));
    await List.insertMany(listings);
    console.log("🌱 Data was initialized");
};

main();