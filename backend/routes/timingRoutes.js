import express from 'express';
import {
  checkIn,
  checkOut,
  finalCheckOut,
  startBreak,
  endBreak,
  getTodayTiming,
} from '../controllers/timingController.js';

const router = express.Router();

router.post('/check-in/:employeeId', checkIn);
router.post('/check-out/:employeeId', checkOut);
router.post('/final-check-out/:employeeId', finalCheckOut);
router.post('/start-break/:employeeId', startBreak);
router.post('/end-break/:employeeId', endBreak);
router.get('/today/:employeeId', getTodayTiming);

export default router;
