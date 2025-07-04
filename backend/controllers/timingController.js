// controllers/timingController.js
import Timing from "../models/timing.js";
import { todayIST } from "../utils/time.js";

export const getTodayTiming = async (req, res) => {
  const { id: employeeId } = req.params;
  const date = todayIST();

  try {
    const timing = await Timing.findOne({ employee: employeeId, date });
    if (!timing) return res.status(404).json({ error: "No timing found" });
    res.status(200).json([timing]); // Keep it array
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch timing" });
  }
};

export const getBreakHistory = async (req, res) => {
  const { id: employeeId } = req.params;

  try {
    const timings = await Timing.find({ employee: employeeId })
      .sort({ date: -1 })
      .select("date breaks");

    const breakData = timings
      .map((t) =>
        t.breaks
          .filter((b) => b.start && b.end)
          .map((brk) => ({
            start: brk.start,
            end: brk.end,
            date: t.date,
          }))
      )
      .flat();

    res.status(200).json(breakData);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch break history" });
  }
};
