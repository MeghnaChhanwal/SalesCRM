// backend/controllers/timingController.js
import Timing from "../models/timing.js";
import { todayIST } from "../utils/time.js";

// ✅ Get today's timing (check-in/out, breaks etc)
export const getTodayTiming = async (req, res) => {
  const { id: employeeId } = req.params;
  const date = todayIST();

  try {
    const timing = await Timing.findOne({ employee: employeeId, date });
    if (!timing) return res.status(404).json({ error: "No timing found for today" });

    res.status(200).json([timing]); // return as array for frontend compatibility
  } catch (error) {
    console.error("Get timing error:", error);
    res.status(500).json({ error: "Failed to fetch timing" });
  }
};

// ✅ Get all break history (for current + past days)
export const getBreakHistory = async (req, res) => {
  const { id: employeeId } = req.params;

  try {
    // Find all timing docs for employee sorted by date descending
    const timings = await Timing.find({ employee: employeeId })
      .sort({ date: -1 })
      .select("date breaks");

    // Extract all breaks with start and end and attach the date for each break
    const breakData = timings
      .map((timing) =>
        timing.breaks
          .filter((brk) => brk.start && brk.end) // only completed breaks
          .map((brk) => ({
            start: brk.start,
            end: brk.end,
            date: timing.date,
          }))
      )
      .flat();

    res.status(200).json(breakData);
  } catch (error) {
    console.error("Break fetch error:", error);
    res.status(500).json({ error: "Failed to fetch break history" });
  }
};
