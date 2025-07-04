import express from "express";
import { loginEmployee, logoutEmployee } from "../controllers/authController.js";

const router = express.Router();

// 🔐 Login route
router.post("/login", loginEmployee);

// 🚪 Logout route by employee ID
router.post("/logout/:id", logoutEmployee);

export default router;
