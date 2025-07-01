// routes/authRoutes.js

import express from "express";
import { loginEmployee, logoutEmployee } from "../controllers/authController.js";

const router = express.Router();

// ✅ Login route
router.post("/login", loginEmployee);

// ✅ Logout route: support both POST (logout button) and GET (sendBeacon fallback)
router.route("/logout/:id").post(logoutEmployee).get(logoutEmployee);

export default router;
