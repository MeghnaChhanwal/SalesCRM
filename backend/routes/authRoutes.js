import express from "express";
import { loginEmployee, logoutEmployee } from "../controllers/authController.js";

const router = express.Router();

router.post("/login", loginEmployee);           // POST /api/auth/login
router.post("/logout/:id", logoutEmployee);     // POST /api/auth/logout/:id

export default router;
