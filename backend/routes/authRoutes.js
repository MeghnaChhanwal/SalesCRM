import express from "express";
import { loginEmployee, logoutEmployee } from "../controllers/authController.js";

const router = express.Router();

router.post("/login", loginEmployee);
router.route("/logout/:id").post(logoutEmployee).get(logoutEmployee);

export default router;
