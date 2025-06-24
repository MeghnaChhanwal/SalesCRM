import Timing from '../models/timing.js';

// 🟢 Check-in
export const checkIn = async (req, res) => {
  const { employeeId } = req.params;
  const now = new Date();
  const today = now.toISOString().split("T")[0];
  const timeStr = now.toLocaleTimeString();

  try {
    let timing = await Timing.findOne({ employee: employeeId, date: today });

    if (!timing) {
      // create new record
      timing = new Timing({
        employee: employeeId,
        date: today,
        checkIn: timeStr,
        status: 'Active',
      });
    } else {
      if (!timing.checkIn) {
        timing.checkIn = timeStr;
        timing.status = 'Active';
      }
    }

    await timing.save();
    res.status(200).json({ message: 'Check-in successful', timing });
  } catch (err) {
    res.status(500).json({ error: 'Failed to check in', details: err });
  }
};

// 🟡 Start break
export const startBreak = async (req, res) => {
  const { employeeId } = req.params;
  const now = new Date();
  const today = now.toISOString().split("T")[0];
  const timeStr = now.toLocaleTimeString();

  try {
    const timing = await Timing.findOne({ employee: employeeId, date: today });

    if (!timing) {
      return res.status(404).json({ message: 'Check-in first before starting a break' });
    }

    timing.breaks.push({ start: timeStr });
    timing.status = 'Inactive';

    await timing.save();
    res.status(200).json({ message: 'Break started', timing });
  } catch (err) {
    res.status(500).json({ error: 'Failed to start break', details: err });
  }
};

// 🟢 End break
export const endBreak = async (req, res) => {
  const { employeeId } = req.params;
  const now = new Date();
  const today = now.toISOString().split("T")[0];
  const timeStr = now.toLocaleTimeString();

  try {
    const timing = await Timing.findOne({ employee: employeeId, date: today });

    const ongoingBreak = timing?.breaks?.find(b => !b.end);
    if (!ongoingBreak) {
      return res.status(400).json({ message: 'No ongoing break' });
    }

    ongoingBreak.end = timeStr;
    timing.status = 'Active';

    await timing.save();
    res.status(200).json({ message: 'Break ended', timing });
  } catch (err) {
    res.status(500).json({ error: 'Failed to end break', details: err });
  }
};

// 🔴 Checkout
export const checkOut = async (req, res) => {
  const { employeeId } = req.params;
  const now = new Date();
  const today = now.toISOString().split("T")[0];
  const timeStr = now.toLocaleTimeString();

  try {
    const timing = await Timing.findOne({ employee: employeeId, date: today });

    if (!timing) {
      return res.status(404).json({ message: 'Check-in first before check-out' });
    }

    timing.checkOut = timeStr;
    timing.status = 'Inactive';

    await timing.save();
    res.status(200).json({ message: 'Checked out successfully', timing });
  } catch (err) {
    res.status(500).json({ error: 'Failed to check out', details: err });
  }
};

// ✅ Get Today's Timing
export const getTodayTiming = async (req, res) => {
  const { employeeId } = req.params;
  const today = new Date().toISOString().split("T")[0];

  try {
    const timing = await Timing.findOne({ employee: employeeId, date: today });

    if (!timing) {
      return res.status(200).json({
        checkIn: null,
        checkOut: null,
        breakStart: null,
        previousBreaks: [],
        isActive: false,
        isOnBreak: false
      });
    }

    const ongoingBreak = timing.breaks?.find(b => !b.end);
    const previousBreaks = timing.breaks?.filter(b => b.end) || [];

    res.status(200).json({
      checkIn: timing.checkIn || null,
      checkOut: timing.checkOut || null,
      breakStart: ongoingBreak?.start || null,
      previousBreaks: previousBreaks.map(b => ({
        start: b.start,
        end: b.end,
        date: timing.date
      })),
      isActive: !timing.checkOut,
      isOnBreak: !!ongoingBreak
    });
  } catch (error) {
    res.status(500).json({ message: "Server error while fetching timing", error });
  }
};
