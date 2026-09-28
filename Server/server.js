import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { Server } from "socket.io";
import "dotenv/config";

import connectDB from "./config/db.js";

// Import Routes
import authRoutes from "./routes/authRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import itemRoutes from "./routes/itemRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";

// Connect to MongoDB
connectDB();

const app = express();

// Create HTTP Server & Initialize Socket.io
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    credentials: true,
  },
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(cookieParser());

// Attach Socket.io instance to req so routes can emit events
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Socket.io Connection Logic
io.on("connection", (socket) => {
  console.log(`⚡ Kitchen Display Client Connected: ${socket.id}`);

  socket.on("disconnect", () => {
    console.log(`🔥 Client Disconnected: ${socket.id}`);
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/orders", orderRoutes);

// Health Check Endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "DineFlow API Running" });
});

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Global Error Middleware
app.use((err, req, res, next) => {
  console.error("Global Error:", err.stack);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
  });
});

// Server Initialization
const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});