// backend/routes/leadRoutes.js
import express from "express";
import multer from "multer";
import {
  getLeads,
  uploadCSV,
  addLeadManually,
  updateLeadStatus,
  scheduleCall
} from "../controllers/leadController.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// ✅ Fetch leads with search + filter
router.get("/", getLeads);

// ✅ Add lead manually
router.post("/", addLeadManually);

// ✅ Upload CSV
router.post("/upload", upload.single("file"), uploadCSV);

// ✅ Update lead status (Open/Closed)
router.patch("/status/:id", updateLeadStatus);

// ✅ Schedule call
router.post("/schedule/:id", scheduleCall);

export default router;
