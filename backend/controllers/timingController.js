import Timing from "../models/timing.js";

// Helpers
const todayStr = () => new Date().toISOString().split("T")[0];
const formatTime = (d = new Date()) => 
  d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });

// ▶️ LOGIN / BREAK END
export const checkIn = async (req, res) => {
  const { employeeId } = req.params;
  const now = new Date();
  const date = todayStr();
  const time = formatTime(now);

  try {
    let timing = await Timing.findOne({ employee: employeeId, date });

    if (!timing) {
      // first login of the day
      timing = new Timing({ employee: employeeId, date, checkIn: time, status: "Active" });
    } else if (timing.breaks.some(b => !b.end)) {
      // end the ongoing break
      const br = timing.breaks.find(b => !b.end);
      br.end = time;
      timing.status = "Active";
    } else {
      // normal login (post–break or second session)
      timing.checkIn = time;
      timing.status = "Active";
    }

    // clear any old checkOut when coming back from break
    timing.checkOut = null;

    await timing.save();
    return res.json({ message: "Logged in / break ended", checkIn: timing.checkIn });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Login / break-end failed" });
  }
};

// ▶️ LOGOUT / BREAK START
export const checkOut = async (req, res) => {
  const { employeeId } = req.params;
  const now = new Date();
  const date = todayStr();
  const time = formatTime(now);

  try {
    const timing = await Timing.findOne({ employee: employeeId, date });
    if (!timing) {
      return res.status(404).json({ error: "No session to break from" });
    }

    if (timing.status === "Active") {
      // Start a break instead of final check-out
      timing.breaks.push({ start: time, end: null });
      timing.status = "Inactive";
      await timing.save();
      return res.json({ message: "Break started", breakStart: time });
    }

    // already on break: ignore
    return res.status(200).json({ message: "Already on break" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Logout / break-start failed" });
  }
};

// ▶️ FINAL CHECK-OUT (optional endpoint, e.g. end of day)
export const finalCheckOut = async (req, res) => {
  const { employeeId } = req.params;
  const now = new Date();
  const date = todayStr();
  const time = formatTime(now);

  try {
    const timing = await Timing.findOne({ employee: employeeId, date });
    if (!timing) return res.status(404).json({ error: "No session to check out" });

    timing.checkOut = time;
    timing.status = "Inactive";
    await timing.save();

    return res.json({ message: "Checked out", checkOut: time });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Final check-out failed" });
  }
};

// ▶️ GET TODAY’S TIMING
export const getTodayTiming = async (req, res) => {
  const { employeeId } = req.params;
  const date = todayStr();

  try {
    const timing = await Timing.findOne({ employee: employeeId, date });
    if (!timing) {
      return res.json({
        checkIn: null,
        checkOut: null,
        breakStart: null,
        previousBreaks: [],
        isActive: false,
        isOnBreak: false
      });
    }

    const ongoing = timing.breaks.find(b => !b.end);
    const previous = timing.breaks.filter(b => b.end);

    return res.json({
      checkIn: timing.checkIn,
      checkOut: timing.checkOut,
      breakStart: ongoing?.start || null,
      previousBreaks: previous.map(b => ({ start: b.start, end: b.end, date })),
      isActive: timing.status === "Active",
      isOnBreak: !!ongoing
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Fetch today timing failed" });
  }
};
