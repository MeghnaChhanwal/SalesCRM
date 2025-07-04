import Timing from "../models/timing.js";
import { todayIST } from "../utils/time.js";

// 📘 1. GET today's timing for a specific employee
export const getTodayTiming = async (req, res) => {
  const { id: employeeId } = req.params;
  const date = todayIST();

  try {
    const timing = await Timing.findOne({ employee: employeeId, date });
    if (!timing) {
      return res.status(404).json({ error: "No timing record found for today" });
    }

    res.status(200).json([timing]); // send as array for frontend compatibility
  } catch (error) {
    console.error("Error fetching today's timing:", error);
    res.status(500).json({ error: "Failed to fetch today's timing" });
  }
};

// 📘 2. GET all completed breaks (optional full history with duration logic)
export const getBreakHistory = async (req, res) => {
  const { id: employeeId } = req.params;

  try {
    const timings = await Timing.find({ employee: employeeId })
      .sort({ date: -1 })
      .select("date breaks");

    const breakData = [];

    for (const timing of timings) {
      for (const brk of timing.breaks) {
        if (brk.start && brk.end) {
          breakData.push({
            start: brk.start,
            end: brk.end,
            date: timing.date,
          });
        }
      }
    }

    res.status(200).json(breakData);
  } catch (error) {
    console.error("Error fetching break history:", error);
    res.status(500).json({ error: "Failed to fetch break history" });
  }
};

// 📘 3. GET last 7 days basic checkin/checkout and break time (no duration)
export const getBreakHistoryBasic = async (req, res) => {
  const { id: employeeId } = req.params;

  try {
    const timings = await Timing.find({ employee: employeeId })
      .sort({ date: -1 })
      .limit(7)
      .select("date checkIn checkOut breaks");

    const breakData = [];

    for (const timing of timings) {
      for (const brk of timing.breaks) {
        if (brk.start && brk.end) {
          breakData.push({
            start: brk.start,
            end: brk.end,
            date: timing.date,
            checkIn: timing.checkIn,
            checkOut: timing.checkOut,
          });
        }
      }
    }

    res.status(200).json(breakData);
  } catch (error) {
    console.error("Error fetching basic break history:", error);
    res.status(500).json({ error: "Failed to fetch basic break history" });
  }
};
