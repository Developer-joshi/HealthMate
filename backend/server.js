import express from "express";
import "dotenv/config";
import cors from "cors";
import { connectDB } from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";
import multer from "multer";
// import cloudinary from "cloudinary";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import adminRouter from "./routes/adminRoute.js";
import doctorRouter from "./routes/doctorRoute.js";
import userRouter from "./routes/userRoute.js";

// App config
const app = express();
const port = process.env.PORT || 4000;
connectDB()
connectCloudinary()

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// API endpoints

app.use("/api/admin",adminRouter)
app.use("/api/doctor",doctorRouter)
app.use('/api/user',userRouter)

// Error handler (place after routes)
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.stack);
  res.status(500).json({ success: false, message: 'Server Error', error: err.message });
});
app.get("/", (req, res) => {
  res.send("HealthMate backend is running!");
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
