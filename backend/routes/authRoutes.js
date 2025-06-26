// routes/authRoutes.js
import express from "express";
import { loginEmployee, logoutEmployee } from "../controllers/authController.js";

const router = express.Router();

// ✅ Login route
router.post("/login", loginEmployee);

// ✅ Logout route (called on tab close/unload)
router.post("/logout/:employeeId", logoutEmployee);

export default router;
