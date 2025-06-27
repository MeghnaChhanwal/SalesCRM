import Timing from "../models/timing.js";
import { todayIST } from "../utils/time.js";
import moment from "moment-timezone";

// 📘 1. Get today's timings for a given employee
export const getTodayTiming = async (req, res) => {
  const { employeeId } = req.params;

  try {
    const date = todayIST();
    const timings = await Timing.find({ employee: employeeId, date }).sort({ createdAt: -1 });
    res.status(200).json(timings);
  } catch (error) {
    console.error("Fetch Today Timing Error:", error);
    res.status(500).json({ error: "Failed to fetch timings" });
  }
};

// 📘 2. Get last 7 days of timing logs
export const getPast7DaysTiming = async (req, res) => {
  const { employeeId } = req.params;

  try {
    const fromDate = moment().tz("Asia/Kolkata").subtract(6, "days").format("YYYY-MM-DD");

    const timings = await Timing.find({
      employee: employeeId,
      date: { $gte: fromDate },
    }).sort({ date: -1 });

    res.status(200).json(timings);
  } catch (error) {
    console.error("Fetch 7-day Timing Error:", error);
    res.status(500).json({ error: "Failed to fetch past 7 days" });
  }
};

// 📘 3. Get total work & break summary for week/month
export const getSummaryTiming = async (req, res) => {
  const { employeeId } = req.params;
  const { range = "week" } = req.query;

  try {
    const daysBack = range === "month" ? 29 : 6;
    const fromDate = moment().tz("Asia/Kolkata").subtract(daysBack, "days").format("YYYY-MM-DD");

    const logs = await Timing.find({
      employee: employeeId,
      date: { $gte: fromDate },
    });

    let totalWorkMinutes = 0;
    let totalBreakMinutes = 0;

    logs.forEach((log) => {
      const checkIn = moment.tz(`${log.date} ${log.checkIn}`, "Asia/Kolkata");
      const checkOut = log.checkOut
        ? moment.tz(`${log.date} ${log.checkOut}`, "Asia/Kolkata")
        : moment();

      const workDuration = checkOut.diff(checkIn, "minutes");

      const breakDuration = log.breaks.reduce((sum, brk) => {
        if (brk.start && brk.end) {
          const start = moment.tz(`${log.date} ${brk.start}`, "Asia/Kolkata");
          const end = moment.tz(`${log.date} ${brk.end}`, "Asia/Kolkata");
          return sum + end.diff(start, "minutes");
        }
        return sum;
      }, 0);

      totalWorkMinutes += workDuration;
      totalBreakMinutes += breakDuration;
    });

    res.status(200).json({
      totalWorkMinutes,
      totalBreakMinutes,
      daysCounted: logs.length,
    });
  } catch (error) {
    console.error("Fetch Summary Error:", error);
    res.status(500).json({ error: "Failed to fetch summary" });
  }
};
