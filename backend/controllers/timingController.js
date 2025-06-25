import Timing from "../models/timing.js";
import { todayIST, timeIST } from "../utils/time.js";

// 1️⃣ Check-In / Re-Login
export const checkIn = async (req, res) => {
  const { employeeId } = req.params;
  const today = todayIST();
  const now = timeIST();

  let timing = await Timing.findOne({ employee: employeeId, date: today });

  if (!timing) {
    // पहिलं login आजचा
    timing = new Timing({
      employee: employeeId,
      date: today,
      checkIn: now,
      checkOut: null,
      status: "Active",
      breaks: [],
    });
  } else {
    // जर open break असेल, तो आजच्या दिवशी treat करा
    const openBreak = timing.breaks.find(b => !b.end);
    if (openBreak) {
      // BreakOff at relogin
      openBreak.end = now;
    } else if (timing.checkOut) {
      // Break between last logout → relogin
      timing.breaks.push({ start: timing.checkOut, end: now, date: today });
    }

    // Resume session
    timing.checkIn = now;
    timing.checkOut = null;
    timing.status = "Active";
  }

  await timing.save();
  res.status(200).json({ timing });
};

// 2️⃣ Final Check-Out / Tab Close
export const finalCheckOut = async (req, res) => {
  const { employeeId } = req.params;
  const today = todayIST();
  const now = timeIST();

  const timing = await Timing.findOne({ employee: employeeId, date: today });
  if (!timing) return res.status(404).json({ error: "No timing found" });

  if (!timing.checkOut) {
    // Logout → set checkOut & Inactive
    timing.checkOut = now;
    timing.status = "Inactive";

    // Start open break
    timing.breaks.push({ start: now, end: null, date: today });
    await timing.save();
  }

  res.status(200).json({ timing });
};

// 3️⃣ Get Today’s Timing
export const getTodayTiming = async (req, res) => {
  const { employeeId } = req.params;
  const today = todayIST();

  const timing = await Timing.findOne({ employee: employeeId, date: today });
  if (!timing) {
    return res.json({
      checkIn: null,
      checkOut: null,
      breakStart: null,
      previousBreaks: [],
      isActive: false,
      isOnBreak: false,
    });
  }

  // Ongoing break only if same-day open
  const ongoingBreak = timing.breaks.find(b => !b.end && b.date === today);
  const previousBreaks = timing.breaks
    .filter(b => b.end && b.date === today)
    .map(b => ({ start: b.start, end: b.end }));

  res.json({
    checkIn: timing.checkIn,
    checkOut: timing.checkOut,
    breakStart: ongoingBreak?.start || null,
    previousBreaks,
    isActive: timing.status === "Active",
    isOnBreak: !!ongoingBreak,
  });
};
