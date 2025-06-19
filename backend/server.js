import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import employeeRoutes from "./routes/employeeRoutes.js";

dotenv.config();
const app = express();

const corsOptions = {
  origin: 'http://localhost:5173', // ✅ only allow your frontend during dev
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // ✅ handles preflight requests

app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

app.use("/api/employees", employeeRoutes);

app.listen(process.env.PORT || 5000, () => {
  console.log("Server running...");
});
