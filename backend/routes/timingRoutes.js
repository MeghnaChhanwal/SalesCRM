// routes/timingRoutes.js

import express from "express";
import {
  autoCheckout,
  // ... other controllers
} from "../controllers/timingController.js";

const router = express.Router();

router.post("/timing/auto-checkout/:employeeId", autoCheckout);

// export other timing-related routes
export default router;
