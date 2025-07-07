import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

//  Route Imports
import employeeRoutes from "./routes/employeeRoutes.js";
import leadRoutes from "./routes/leadRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import timingRoutes from "./routes/timingRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import activityRoutes from "./routes/activityRoutes.js";

dotenv.config();

const app = express();


connectDB();


const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "https://sales-employee.vercel.app" 
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith(".vercel.app")) {
      callback(null, true);
    } else {
      console.warn("CORS blocked for origin:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); 

//  Middleware
app.use(express.json());

// API Routes
app.use("/api/employees", employeeRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/timing", timingRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/activity", activityRoutes);


app.use((req, res) => {
  res.status(404).json({ error: "API route not found" });
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
});
