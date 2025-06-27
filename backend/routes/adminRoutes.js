// backend/routes/adminRoutes.js
import express from "express";
import { updateAdminProfile } from "../controllers/adminController.js";

const router = express.Router();

// PUT /api/admin/update
router.put("/update", updateAdminProfile);

export default router;
