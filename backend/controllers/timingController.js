import Timing from "../models/timing.js";
import { todayIST, timeIST } from "../utils/time.js";

// ✅ Get Today's Timing
export const getTodayTiming = async (req, res) => {
  const { id: employeeId } = req.params;
  const date = todayIST();

  try {
    const timing = await Timing.findOne({ employee: employeeId, date });
    if (!timing) return res.status(404).json({ error: "No timing found" });

    res.status(200).json({ timing });
  } catch (error) {
    console.error("Get timing error:", error);
    res.status(500).json({ error: "Failed to fetch timing" });
  }
};

// ✅ Get All Breaks (Optional use)
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
    console.error("Break fetch error:", error);
    res.status(500).json({ error: "Failed to fetch break history" });
  }
};

// ✅ Admin Only: Fetch all timings
export const getAllTimings = async (req, res) => {
  try {
    const timings = await Timing.find()
      .populate("employee", "firstName lastName email")
      .sort({ date: -1 });

    res.status(200).json(timings);
  } catch (error) {
    console.error("Fetch all timings error:", error);
    res.status(500).json({ error: "Failed to fetch timings" });
  }
};
