import express from "express";
import multer from "multer";
import {
  getLeads,
  addLeadManually,
  uploadCSV,
  updateLeadType,
  updateLeadStatus,
  scheduleCall,
  getScheduledCalls
} from "../controllers/leadController.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// ✅ Route: GET /api/leads
router.get("/", getLeads);

// ✅ Route: POST /api/leads
router.post("/", addLeadManually);

// ✅ Route: POST /api/leads/upload
router.post("/upload", upload.single("file"), uploadCSV);

// ✅ Route: PATCH /api/leads/:id/type
router.patch("/:id/type", updateLeadType);

// ✅ Route: PATCH /api/leads/:id/status
router.patch("/:id/status", updateLeadStatus);

// ✅ Route: POST /api/leads/:id/schedule
router.post("/:id/schedule", scheduleCall);

// ✅ Route: GET /api/leads/schedule
router.get("/schedule", getScheduledCalls);

export default router;
