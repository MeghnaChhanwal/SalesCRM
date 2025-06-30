import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";

// ✅ Routes
import employeeRoutes from "./routes/employeeRoutes.js";
import leadRoutes from "./routes/leadRoutes.js";
import timeRoutes from "./routes/timingRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

dotenv.config();

const app = express();

// ✅ Ensure upload folder exists
const uploadFolder = "upload";
if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder);
}

// ✅ Allow All Origins - CORS Configuration
app.use(
  cors({
    origin: true, // Reflect request origin
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ✅ Middleware
app.use(express.json());

// ✅ MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ✅ API Routes
app.use("/api/employees", employeeRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/timing", timeRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

// ✅ Root route
app.get("/", (req, res) => {
  res.send("🚀 SalesCRM Backend is running");
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
