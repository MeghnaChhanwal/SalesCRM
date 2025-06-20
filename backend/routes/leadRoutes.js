// routes/leadRoutes.js

import express from "express";
import { getLeads, uploadCSV, exportCSV } from "../controllers/leadController.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

router.get("/", getLeads); // ✅ /api/leads
router.post("/upload", upload.single("file"), uploadCSV); // ✅ /api/leads/upload
router.get("/export", exportCSV); // ✅ /api/leads/export

export default router;
