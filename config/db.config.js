const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL, {
      serverSelectionTimeoutMS: 5000, 
    });
    console.log("Connected to Database!");
  } catch (e) {
    console.error("Failed to connect to MongoDB:", e.message);
    process.exit(1); 
  }
};

module.exports = connectDB;
