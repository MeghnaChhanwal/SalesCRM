import Timing from "../models/timing.js";
import Employee from "../models/employee.js";
import { todayIST, timeIST } from "../utils/time.js";

// 🟢 Login or Relogin
export const handleCheckInOrBreakEnd = async (employeeId) => {
  const date = todayIST();
  const time = timeIST();

  let timing = await Timing.findOne({ employee: employeeId, date });

  if (!timing) {
    // First login today
    timing = new Timing({
      employee: employeeId,
      date,
      checkIn: time,
      status: "Active",
      breakStatus: "OffBreak",
      breaks: [],
    });
  } else {
    // Relogin: update check-in time
    timing.checkIn = time;

    const lastBreak = timing.breaks.length > 0 ? timing.breaks[timing.breaks.length - 1] : null;

    // If last break is open, end it now
    if (lastBreak && !lastBreak.end) {
      lastBreak.end = time;
      timing.breakStatus = "OffBreak";
    }
  }

  await timing.save();
  return { message: "Check-in updated", timing };
};

// 🔴 Logout / Tab Close
export const handleFinalCheckOut = async (employeeId) => {
  const date = todayIST();
  const time = timeIST();

  const timing = await Timing.findOneAndUpdate(
    { employee: employeeId, date, checkOut: { $exists: false } },
    {
      checkOut: time,
      status: "Inactive",
      $push: { breaks: { start: time } }, // Start new break
      breakStatus: "OnBreak",
    },
    { new: true }
  );

  await Employee.findByIdAndUpdate(employeeId, { status: "Inactive" });
  return timing;
};

// 📘 Get All Timings for Today
export const getTodayTimings = async (employeeId) => {
  const date = todayIST();
  return await Timing.find({ employee: employeeId, date }).sort({ createdAt: -1 });
};
