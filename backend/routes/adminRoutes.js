import express from "express";
import { updateAdminProfile } from "../controllers/adminController.js";

const router = express.Router();

// ✅ Test route
router.get("/ping", (req, res) => {
  res.send("✅ admin route working");
});

// PUT /api/admin/update
router.put("/update", updateAdminProfile);

export default router;
