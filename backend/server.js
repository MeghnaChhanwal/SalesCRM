import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import employeeRoutes from "./routes/employeeRoutes.js";
import leadRoutes from "./routes/leadRoutes.js";
import timeRoutes from "./routes/timingRoutes.js";

dotenv.config();

const app = express();

// ✅ Upload folder create if missing
const uploadFolder = "upload";
if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder);
}

// ✅ CORS configuration
const corsOptions = {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(express.json());

// ✅ MongoDB Connection (without deprecated options)
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ✅ API Routes
app.use("/api/employees", employeeRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/timing", timeRoutes);

// ✅ Root route for health check
app.get("/", (req, res) => {
  res.send("🚀 SalesCRM Backend is running");
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
