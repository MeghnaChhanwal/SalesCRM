// services/timingService.js
import Timing from "../models/timing.js";
import Employee from "../models/employee.js";
import { todayIST, timeIST } from "../utils/time.js";

// ✅ Check-in OR End Break (called on login)
export const handleCheckInOrBreakEnd = async (employeeId) => {
  const date = todayIST();
  const time = timeIST();

  let timing = await Timing.findOne({ employee: employeeId, date });

  if (!timing) {
    // First login today — create new timing entry
    timing = new Timing({
      employee: employeeId,
      date,
      checkIn: time,
      status: "Active",
      breaks: [],
    });
  } else {
    // Already checked in today — update check-in time
    timing.checkIn = time;

    // If currently on break, end it
    const lastBreak = timing.breaks.length > 0 ? timing.breaks[timing.breaks.length - 1] : null;
    if (lastBreak && !lastBreak.end) {
      lastBreak.end = time;
    }
  }

  await timing.save();
  return { message: "Check-in updated", timing };
};

// ✅ Final Check-Out (called on tab close or manual logout)
export const handleFinalCheckOut = async (employeeId) => {
  const date = todayIST();
  const time = timeIST();

  const timing = await Timing.findOneAndUpdate(
    { employee: employeeId, date, checkOut: { $exists: false } },
    { checkOut: time, status: "Inactive" },
    { new: true }
  );

  await Employee.findByIdAndUpdate(employeeId, { status: "Inactive" });

  return timing;
};

// ✅ Fetch all today's timing logs
export const getTodayTimings = async (employeeId) => {
  const date = todayIST();
  return await Timing.find({ employee: employeeId, date }).sort({ createdAt: -1 });
};
