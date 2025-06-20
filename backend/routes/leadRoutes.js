import express from "express";
import { getLeads, uploadCSV, exportCSV } from "../controllers/leadController.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

// ✅ /api/leads/
router.get("/", getLeads);

// ✅ /api/leads/upload
router.post("/upload", upload.single("file"), uploadCSV);

// ✅ /api/leads/export
router.get("/export", exportCSV);

export default router;
