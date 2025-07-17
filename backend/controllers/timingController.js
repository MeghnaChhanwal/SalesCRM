import Timing from "../models/timing.js";
import Employee from "../models/employee.js";
import { todayIST, timeIST } from "../utils/time.js";

// today timing
export const getTodayTiming = async (req, res) => {
  try {
    const { id } = req.params;
    const today = todayIST();

    const timing = await Timing.find({ employee: id, date: today });
    res.status(200).json(timing);
  } catch (err) {
    console.error("Timing fetch error", err);
    res.status(500).json({ error: "Failed to fetch today's timing" });
  }
};

// break history
export const getBreakHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 6); 

    const breaks = await Timing.find({
      employee: id,
      date: { $gte: last7Days.toISOString().split("T")[0] },
    })
      .sort({ date: -1 })
      .select("date breaks");

    const formatted = breaks.flatMap((day) =>
      day.breaks
        .filter((b) => b.start && b.end)
        .map((b) => ({
          date: day.date,
          start: b.start,
          end: b.end,
        }))
    );

    res.status(200).json(formatted);
  } catch (err) {
    console.error(" Break fetch error", err);
    res.status(500).json({ error: "Failed to fetch break history" });
  }
};

//  Check In
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
        checkOut: null,
        status: "Active",
        breakStatus: "OffBreak",
        breaks: [],
      });
    } else {
      timing.checkIn = time;
      timing.checkOut= null;
      timing.status = "Active";
      timing.breakStatus = "OffBreak";

      const lastBreak = timing.breaks[timing.breaks.length - 1];
      if (lastBreak && !lastBreak.end) {
        lastBreak.end = time;
      }
    }

    await timing.save();

    //  employee status
    await Employee.findByIdAndUpdate(employeeId, { status: "Active" });

    res.status(200).json({ message: "Check-in successful", timing });
  } catch (err) {
    console.error("Check-in error:", err);
    res.status(500).json({ error: "Failed to check in" });
  }
};

// Check Out
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

    timing.breaks.push({ start: time });

    await timing.save();

 
    await Employee.findByIdAndUpdate(employeeId, { status: "Inactive" });

    res.status(200).json({ message: "Check-out successful", timing });
  } catch (err) {
    console.error(" Check-out error:", err);
    res.status(500).json({ error: "Failed to check out" });
  }
};

//  Start Break
export const startBreak = async (req, res) => {
  const { id: employeeId } = req.params;
  const date = todayIST();
  const time = timeIST();

  try {
    const timing = await Timing.findOne({ employee: employeeId, date });
    if (!timing || timing.breakStatus === "OnBreak") {
      return res.status(400).json({ error: "Already on break or no check-in found" });
    }

    timing.breakStatus = "OnBreak";
    timing.breaks.push({ start: time });

    await timing.save();

    res.status(200).json({ message: "Break started", timing });
  } catch (err) {
    console.error(" Start break error:", err);
    res.status(500).json({ error: "Failed to start break" });
  }
};

//  End Break
export const endBreak = async (req, res) => {
  const { id: employeeId } = req.params;
  const date = todayIST();
  const time = timeIST();

  try {
    const timing = await Timing.findOne({ employee: employeeId, date });
    if (!timing || timing.breakStatus === "OffBreak") {
      return res.status(400).json({ error: "Not currently on a break" });
    }

    const currentBreak = timing.breaks[timing.breaks.length - 1];
    if (currentBreak && !currentBreak.end) {
      currentBreak.end = time;
    }

    timing.breakStatus = "OffBreak";
    await timing.save();

    res.status(200).json({ message: "Break ended", timing });
  } catch (err) {
    console.error(" End break error:", err);
    res.status(500).json({ error: "Failed to end break" });
  }
};
