import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";

// ✅ Load environment variables
dotenv.config();

const app = express();

// ✅ Create upload folder if it doesn't exist
const uploadFolder = "upload";
if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder);
}

// ✅ Dynamic CORS middleware for localhost + *.vercel.app
app.use((req, res, next) => {
  const allowedOrigins = [
    "http://localhost:5173", // Dev frontend
  ];

  const origin = req.headers.origin;

  // Allow if origin is localhost or ends with .vercel.app
  if (
    origin &&
    (allowedOrigins.includes(origin) || origin.endsWith(".vercel.app"))
  ) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Allow-Credentials", "true");
  }

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

// ✅ Body parsers
app.use(express.json());
app.use(express.text()); // For navigator.sendBeacon()

// ✅ Serve static uploaded files
app.use("/uploads", express.static("upload"));

// ✅ MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ✅ Routes import
import employeeRoutes from "./routes/employeeRoutes.js";
import leadRoutes from "./routes/leadRoutes.js";
import timeRoutes from "./routes/timingRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";

// ✅ Use Routes
app.use("/api/employees", employeeRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/timing", timeRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/dashboard", dashboardRoutes);

// ✅ Default route
app.get("/", (req, res) => {
  res.send("🚀 SalesCRM Backend is running");
});

// ✅ Global error handler
app.use((err, req, res, next) => {
  console.error("🔥 Global Error:", err.message);
  res.status(500).json({ error: err.message || "Internal Server Error" });
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
