import Timing from "../models/timing.js";
import { todayIST, timeIST } from "../utils/time.js";

// ✅ Check-In (on login)
export const checkIn = async (req, res) => {
  const { employeeId } = req.params;
  const today = todayIST();
  const timeStr = timeIST();

  try {
    let timing = await Timing.findOne({ employee: employeeId, date: today });

    if (!timing) {
      // First login of the day
      timing = new Timing({
        employee: employeeId,
        date: today,
        checkIn: timeStr,
        status: "Active",
        breaks: [],
      });
    } else {
      // Re-login: update checkIn and end previous break if open
      timing.checkIn = timeStr;
      const lastBreak = timing.breaks?.find((b) => !b.end);
      if (lastBreak) lastBreak.end = timeStr;
      timing.status = "Active";
    }

    await timing.save();
    res.status(200).json({ message: "Check-in successful", timing });
  } catch (err) {
    res.status(500).json({ error: "Failed to check in", details: err });
  }
};

// ✅ Manual Logout
export const checkOut = async (req, res) => {
  const { employeeId } = req.params;
  const today = todayIST();
  const timeStr = timeIST();

  try {
    const timing = await Timing.findOne({ employee: employeeId, date: today });
    if (!timing) return res.status(404).json({ message: "Check-in first" });

    timing.checkOut = timeStr;
    timing.status = "Inactive";

    await timing.save();
    res.status(200).json({ message: "Checked out", timing });
  } catch (err) {
    res.status(500).json({ error: "Check-out failed", details: err });
  }
};

// ✅ Final Check-Out (Tab close → break auto)
export const finalCheckOut = async (req, res) => {
  const { employeeId } = req.params;
  const today = todayIST();
  const timeStr = timeIST();

  try {
    const timing = await Timing.findOne({ employee: employeeId, date: today });
    if (!timing) return res.status(404).json({ message: "No timing found" });

    const ongoingBreak = timing.breaks?.find((b) => !b.end);
    if (!ongoingBreak) {
      timing.breaks.push({ start: timeStr, date: today });
    }

    timing.checkOut = timeStr;
    timing.status = "Inactive";

    await timing.save();
    res.status(200).json({ message: "Final check-out complete", timing });
  } catch (err) {
    res.status(500).json({ error: "Final check-out failed", details: err });
  }
};

// ✅ Start Break (manual button)
export const startBreak = async (req, res) => {
  const { employeeId } = req.params;
  const today = todayIST();
  const timeStr = timeIST();

  try {
    const timing = await Timing.findOne({ employee: employeeId, date: today });
    if (!timing) return res.status(404).json({ message: "Check-in first" });

    timing.breaks.push({ start: timeStr, date: today });
    timing.status = "Inactive";

    await timing.save();
    res.status(200).json({ message: "Break started", timing });
  } catch (err) {
    res.status(500).json({ error: "Break start failed", details: err });
  }
};

// ✅ End Break (manual button)
export const endBreak = async (req, res) => {
  const { employeeId } = req.params;
  const today = todayIST();
  const timeStr = timeIST();

  try {
    const timing = await Timing.findOne({ employee: employeeId, date: today });
    if (!timing) return res.status(404).json({ message: "Check-in first" });

    const ongoingBreak = timing.breaks.find((b) => !b.end);
    if (!ongoingBreak) return res.status(400).json({ message: "No ongoing break" });

    ongoingBreak.end = timeStr;
    timing.status = "Active";

    await timing.save();
    res.status(200).json({ message: "Break ended", timing });
  } catch (err) {
    res.status(500).json({ error: "Break end failed", details: err });
  }
};

// ✅ Get Today's Timing (for frontend display)
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

    const ongoingBreak = timing.breaks?.find((b) => !b.end);
    const previousBreaks = timing.breaks?.filter((b) => b.end) || [];

    res.status(200).json({
      checkIn: timing.checkIn || null,
      checkOut: null, // ✅ Always hide on UI (as discussed)
      breakStart: ongoingBreak?.start || null,
      previousBreaks: previousBreaks.map((b) => ({
        start: b.start,
        end: b.end || "--:--",
        date: b.date,
      })),
      isActive: !timing.checkOut,
      isOnBreak: !!ongoingBreak,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching timing", error });
  }
};
