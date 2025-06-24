import express from 'express';
import {
  checkIn,
  startBreak,
  endBreak,
  checkOut,
  getTodayTiming
} from '../controllers/timingController.js';

const router = express.Router();

// Routes
router.post('/check-in/:employeeId', checkIn);
router.post('/start-break/:employeeId', startBreak);
router.post('/end-break/:employeeId', endBreak);
router.post('/check-out/:employeeId', checkOut);
router.get('/today/:employeeId', getTodayTiming);

export default router;
