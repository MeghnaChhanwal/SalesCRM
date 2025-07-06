import Timing from "../models/timing.js";
import { todayIST, timeIST } from "../utils/time.js";

// 🔹 GET: Today's check-in/check-out/breaks
export const getTodayTiming = async (req, res) => {
  const { id: employeeId } = req.params;
  const date = todayIST();

  try {
    const timing = await Timing.findOne({ employee: employeeId, date });
    if (!timing) return res.status(404).json({ error: "No timing found" });

    res.status(200).json([timing]); // Sent as array for frontend table
  } catch (error) {
    console.error("Get timing error:", error);
    res.status(500).json({ error: "Failed to fetch timing" });
  }
};

// 🔹 GET: Full break history
export const getBreakHistory = async (req, res) => {
  const { id: employeeId } = req.params;

  try {
    const timings = await Timing.find({ employee: employeeId })
      .sort({ date: -1 })
      .select("date breaks");

    const breakData = timings
      .flatMap((t) =>
        t.breaks
          .filter((b) => b.start && b.end)
          .map((brk) => ({
            date: t.date,
            start: brk.start,
            end: brk.end,
          }))
      );

    res.status(200).json(breakData);
  } catch (error) {
    console.error("Break fetch error:", error);
    res.status(500).json({ error: "Failed to fetch break history" });
  }
};

// 🔹 POST: Manual Check-in (used for cases outside login logic)
export const checkIn = async (req, res) => {
  const { id: employeeId } = req.params;
  const date = todayIST();
  const time = timeIST();

  try {
    let timing = await Timing.findOne({ employee: employeeId, date });

    if (!timing) {
      timing = new Timing({
        employee: employeeId,
        date,
        checkIn: time,
        status: "Active",
        breakStatus: "OffBreak",
        breaks: [],
      });
    } else {
      timing.checkIn = time;
      timing.status = "Active";
      timing.breakStatus = "OffBreak";

      const lastBreak = timing.breaks[timing.breaks.length - 1];
      if (lastBreak && !lastBreak.end) {
        lastBreak.end = time;
      }
    }

    await timing.save();
    res.status(200).json({ message: "Check-in successful", timing });
  } catch (err) {
    console.error("Check-in error:", err);
    res.status(500).json({ error: "Failed to check in" });
  }
};

// 🔹 POST: Check-out
export const checkOut = async (req, res) => {
  const { id: employeeId } = req.params;
  const date = todayIST();
  const time = timeIST();

  try {
    const timing = await Timing.findOne({ employee: employeeId, date });

    if (!timing || timing.checkOut) {
      return res.status(400).json({ error: "Already checked out or not checked in" });
    }

    timing.checkOut = time;
    timing.status = "Inactive";
    timing.breakStatus = "OnBreak";

    // Optional: record idle break after checkout
    timing.breaks.push({ start: time });
    await timing.save();

    res.status(200).json({ message: "Check-out successful", timing });
  } catch (err) {
    console.error("Check-out error:", err);
    res.status(500).json({ error: "Failed to check out" });
  }
};

// 🔹 POST: Start Break
export const startBreak = async (req, res) => {
  const { id: employeeId } = req.params;
  const date = todayIST();
  const time = timeIST();

  try {
    const timing = await Timing.findOne({ employee: employeeId, date });
    if (!timing) return res.status(404).json({ error: "Check-in required before break" });

    const ongoing = timing.breaks.some((b) => b.start && !b.end);
    if (ongoing) return res.status(400).json({ error: "Break already in progress" });

    timing.breaks.push({ start: time });
    timing.breakStatus = "OnBreak";
    timing.status = "OnBreak";

    await timing.save();
    res.status(200).json({ message: "Break started", timing });
  } catch (error) {
    console.error("Start break error:", error);
    res.status(500).json({ error: "Failed to start break" });
  }
};

// 🔹 POST: End Break
export const endBreak = async (req, res) => {
  const { id: employeeId } = req.params;
  const date = todayIST();
  const time = timeIST();

  try {
    const timing = await Timing.findOne({ employee: employeeId, date });
    if (!timing) return res.status(404).json({ error: "No active timing record" });

    const activeBreak = timing.breaks.find((b) => b.start && !b.end);
    if (!activeBreak) return res.status(400).json({ error: "No active break to end" });

    activeBreak.end = time;
    timing.breakStatus = "OffBreak";
    timing.status = "Active";

    await timing.save();
    res.status(200).json({ message: "Break ended", timing });
  } catch (error) {
    console.error("End break error:", error);
    res.status(500).json({ error: "Failed to end break" });
  }
};
