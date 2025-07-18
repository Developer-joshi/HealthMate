
import express from "express";
import "dotenv/config";
import cors from "cors";
import { connectDB } from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";
import adminRouter from "./routes/adminRoute.js";
import doctorRouter from "./routes/doctorRoute.js";
import userRouter from "./routes/userRoute.js";

import http from "http";
import { Server } from "socket.io";

// ✅ App config first
const app = express();
const port = process.env.PORT || 4000;

// ✅ Now use app to create HTTP server
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      "https://health-mate-gold.vercel.app/",
      "health-mate-admin.vercel.app",
    ], // change this to your frontend URL in prod
    methods: ["GET", "POST"],
  },
});

// ✅ Connect services
connectDB();
connectCloudinary();

// ✅ Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// ✅ Routes
app.use("/api/admin", adminRouter);
app.use("/api/doctor", doctorRouter);
app.use("/api/user", userRouter);

// ✅ Health check
app.get("/", (req, res) => {
  res.send("HealthMate backend is running!");
});

// ✅ Error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.stack);
  res.status(500).json({
    success: false,
    message: "Server Error",
    error: err.message,
  });
});

// ✅ WebSocket logic
io.on("connection", (socket) => {
  console.log("🟢 A user connected");

  socket.on("join-room", (roomId) => {
    socket.join(roomId);
    socket.to(roomId).emit("joined");
  });

  socket.on("offer", ({ roomId, offer }) => {
    socket.to(roomId).emit("offer", offer);
  });

  socket.on("answer", ({ roomId, answer }) => {
    socket.to(roomId).emit("answer", answer);
  });

  socket.on("ice-candidate", ({ roomId, candidate }) => {
    socket.to(roomId).emit("ice-candidate", { candidate });
  });

  socket.on("disconnect", () => {
    console.log("🔴 A user disconnected");
  });

  socket.on("call-ended", (roomId) => {
    io.to(roomId).emit("call-ended");
  });

});

// ✅ Start both HTTP and WebSocket server
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
