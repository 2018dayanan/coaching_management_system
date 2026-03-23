const mongoose = require("mongoose");

const databaseConnection = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL, {
      serverSelectionTimeoutMS: 5000, 
    });
    console.log("Connected to Database!");
  } catch (e) {
    console.error("Failed to connect to MongoDB:", e.message);
  }
};
module.exports = databaseConnection;