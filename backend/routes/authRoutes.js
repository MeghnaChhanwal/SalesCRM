import express from "express";
import {
  loginEmployee,
  logoutEmployee,
  autoCheckout,
} from "../controllers/authController.js";

const router = express.Router();

// ✅ POST: Employee login
router.post("/login", loginEmployee);

// ✅ GET: Logout with employee ID
router.get("/logout/:id", logoutEmployee);

// ✅ GET: Auto checkout triggered via tab close
router.get("/auto-checkout/:id", autoCheckout);

export default router;
