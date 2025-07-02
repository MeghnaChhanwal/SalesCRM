import express from "express";
import multer from "multer";
import {
  getLeads,
  uploadCSV,
  addLeadManually
} from "../controllers/leadController.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.get("/", getLeads);
router.post("/", addLeadManually); // ✅ Manual
router.post("/upload", upload.single("file"), uploadCSV); // ✅ CSV

export default router;
