import Timing from "../models/timing.js";
import { todayIST, timeIST } from "../utils/time.js";

// ✅ 1. Check-In
export const checkIn = async (req, res) => {
  const { employeeId } = req.params;
  const today = todayIST();
  const now = timeIST();

  try {
    let timing = await Timing.findOne({ employee: employeeId, date: today });

    if (!timing) {
      timing = new Timing({
        employee: employeeId,
        date: today,
        checkIn: now,
        status: "Active",
        breaks: [],
      });
    } else {
      const openBreak = timing.breaks.find(b => !b.end);
      if (openBreak) openBreak.end = now;

      else if (timing.checkOut) {
        timing.breaks.push({
          start: timing.checkOut,
          end: now,
          date: today,
        });
      }

      timing.checkIn = now;
      timing.checkOut = null;
      timing.status = "Active";
    }

    await timing.save();
    res.status(200).json({ message: "Check-in successful", timing });
  } catch (err) {
    res.status(500).json({ error: "Check-in failed", details: err.message });
  }
};

// ✅ 2. Final Check-Out (Tab Close)
export const finalCheckOut = async (req, res) => {
  const { employeeId } = req.params;
  const today = todayIST();
  const now = timeIST();

  try {
    const timing = await Timing.findOne({ employee: employeeId, date: today });
    if (!timing) return res.status(404).json({ error: "No timing found" });

    if (!timing.checkOut) {
      timing.checkOut = now;
      timing.status = "Inactive";
      timing.breaks.push({ start: now, end: null, date: today });
      await timing.save(); // <--- THIS IS CORRECT
    }

    res.status(200).json({ message: "Final check-out completed", timing });
  } catch (err) {
    res.status(500).json({ error: "Final check-out failed", details: err.message });
  }
};

// ✅ 3. Get today's timing
export const getTodayTiming = async (req, res) => {
  const { employeeId } = req.params;
  const today = todayIST();

  try {
    const timing = await Timing.findOne({ employee: employeeId, date: today });

    if (!timing) {
      return res.status(200).json({
        checkIn: null,
        checkOut: null,
        breakStart: null,
        previousBreaks: [],
        isActive: false,
        isOnBreak: false,
      });
    }

    const ongoingBreak = timing.breaks.find(b => !b.end);
    const previousBreaks = timing.breaks.filter(b => b.end);

    res.status(200).json({
      checkIn: timing.checkIn || null,
      checkOut: ongoingBreak ? null : timing.checkOut || null,
      breakStart: ongoingBreak?.start || null,
      previousBreaks,
      isActive: timing.status === "Active",
      isOnBreak: !!ongoingBreak,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch today's timing", details: err.message });
  }
};
