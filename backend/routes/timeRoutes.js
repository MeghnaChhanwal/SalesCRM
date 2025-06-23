import express from "express";
import {
  getAllEmployeeStatus
} from "../controllers/timeController.js";

const router = express.Router();

router.get("/status", getAllEmployeeStatus);

export default router;
