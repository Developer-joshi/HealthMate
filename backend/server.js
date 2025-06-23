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

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
