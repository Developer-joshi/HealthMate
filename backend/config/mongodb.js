import mongoose from "mongoose";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

export const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("DB Connected");
  } 
  catch (error) {
    console.error("DB Connection Failed:", error.message);
    process.exit(1);
  }
};
