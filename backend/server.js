import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

// 🛣️ Route Imports
import employeeRoutes from "./routes/employeeRoutes.js";
import leadRoutes from "./routes/leadRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import timingRoutes from "./routes/timingRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import activityRoutes from "./routes/activityRoutes.js";

// 🌍 Load environment variables
dotenv.config();

// ✅ Initialize Express App
const app = express();

// ✅ Connect MongoDB
connectDB();

// ✅ Allow all origins with credentials (⚠️ Use only in dev)
app.use(cors({
  origin: (origin, callback) => {
    // Allow all origins or undefined (like Postman)
    callback(null, true);
  },
  credentials: true
}));

// ✅ Handle Preflight Requests Globally
app.options("*", cors());

// ✅ JSON Body Parser Middleware
app.use(express.json());

// ✅ API Routes
app.use("/api/employees", employeeRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/timing", timingRoutes);
app.use("/api/admin", adminRoutes);         // Admin tools
app.use("/api/activity", activityRoutes);   // Employee & Admin activity logs

// 🚫 Catch-all route for undefined paths
app.use((req, res) => {
  res.status(404).json({ error: "API route not found" });
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
