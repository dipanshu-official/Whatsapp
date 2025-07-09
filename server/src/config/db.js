import mongoose from "mongoose";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

const connectDB = async () => {
  try {
    console.log("Connecting to MongoDB...=>", process.env.MONGO_URI);
    const connect = await mongoose.connect(process.env.MONGO_URI);
     console.log("MongoDB connected:", connect.connection.host);
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

export default connectDB
