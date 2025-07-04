// controllers/timingController.js
import Timing from "../models/timing.js";
import { todayIST } from "../utils/time.js";

// 📘 GET today's timing for a specific employee
export const getTodayTiming = async (req, res) => {
  const { id: employeeId } = req.params;
  const date = todayIST();

  try {
    const timing = await Timing.findOne({ employee: employeeId, date });
    if (!timing) {
      return res.status(404).json({ error: "No timing record found for today" });
    }

    res.status(200).json([timing]); // Send as array for frontend compatibility
  } catch (error) {
    console.error("Error fetching today's timing:", error);
    res.status(500).json({ error: "Failed to fetch today's timing" });
  }
};

// 📘 GET all completed break history for a specific employee
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
