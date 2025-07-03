// routes/authRoutes.js

import express from "express";
import { loginEmployee } from "../controllers/authController.js";

const router = express.Router();

// ✅ Login route
router.post("/login", loginEmployee);

// ❌ Removed logout route since you're using auto-checkout on tab close

export default router;
