// routes/authRoutes.js
import express from "express";
import { loginEmployee, logoutEmployee } from "../controllers/authController.js";

const router = express.Router();

router.post("/login", loginEmployee);
router.post("/logout/:id", logoutEmployee);

export default router;
