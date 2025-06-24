import express from 'express';
import {
  checkIn,
  startBreak,
  endBreak,
  checkOut,
  finalCheckOut,
  getTodayTiming
} from '../controllers/timingController.js';

const router = express.Router();

// ✅ Timing API Endpoints
router.post('/check-in/:employeeId', checkIn);
router.post('/start-break/:employeeId', startBreak);
router.post('/end-break/:employeeId', endBreak);
router.post('/check-out/:employeeId', checkOut);
router.post('/final-check-out/:employeeId', finalCheckOut); // 👈 New route
router.get('/today/:employeeId', getTodayTiming);

export default router;
