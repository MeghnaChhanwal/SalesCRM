import Timing from "../models/timing.js";
import { todayIST, timeIST } from "../utils/time.js";

// ✅ Get today's timing for employee
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

// ✅ Get full break history across all days
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

// ✅ Manually start break
export const startBreak = async (req, res) => {
  const { id: employeeId } = req.params;
  const date = todayIST();
  const time = timeIST();

  try {
    const timing = await Timing.findOne({ employee: employeeId, date });
    if (!timing) return res.status(404).json({ error: "Timing not found" });

    timing.breakStatus = "OnBreak";
    timing.status = "Inactive";
    timing.breaks.push({ start: time });

    await timing.save();
    res.status(200).json({ message: "Break started", timing });
  } catch (error) {
    console.error("Start break error:", error);
    res.status(500).json({ error: "Failed to start break" });
  }
};

// ✅ Manually end break
export const endBreak = async (req, res) => {
  const { id: employeeId } = req.params;
  const date = todayIST();
  const time = timeIST();

  try {
    const timing = await Timing.findOne({ employee: employeeId, date });
    if (!timing) return res.status(404).json({ error: "Timing not found" });

    const lastBreak = timing.breaks[timing.breaks.length - 1];
    if (!lastBreak || lastBreak.end) {
      return res.status(400).json({ error: "No ongoing break to end" });
    }

    lastBreak.end = time;
    timing.breakStatus = "OffBreak";
    timing.status = "Active";

    await timing.save();
    res.status(200).json({ message: "Break ended", timing });
  } catch (error) {
    console.error("End break error:", error);
    res.status(500).json({ error: "Failed to end break" });
  }
};

// ✅ Get full timing history for admin dashboard
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
