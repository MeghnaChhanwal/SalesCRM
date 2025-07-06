// server.js

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

// 🌍 Load env variables
dotenv.config();

// Initialize app
const app = express();

// ✅ Connect to MongoDB
connectDB();

// ✅ CORS Configuration
const allowedOrigins = [
  "http://localhost:5173", // Dev
  "https://sales-employee.vercel.app", // Prod main domain
];

// ✅ Allow all *.vercel.app for preview deployments
const corsOptions = {
  origin: function (origin, callback) {
    if (
      !origin || // allow non-browser tools like Postman
      allowedOrigins.includes(origin) ||
      /\.vercel\.app$/.test(origin)
    ) {
      callback(null, true);
    } else {
      console.warn(`🚫 CORS blocked for origin: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));

// ✅ Preflight requests support
app.options("*", cors(corsOptions));

// ✅ JSON Parser
app.use(express.json());

// ✅ API Routes
app.use("/api/employees", employeeRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/timing", timingRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/activity", activityRoutes);

// ❌ Catch-all 404 route
app.use((req, res) => {
  res.status(404).json({ error: "API route not found" });
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
