// utils/time.js
import moment from "moment-timezone";

// ✅ Get today's date in IST
export const todayIST = () => moment().tz("Asia/Kolkata").format("YYYY-MM-DD");

// ✅ Get current time in IST
export const timeIST = () => moment().tz("Asia/Kolkata").format("hh:mm:ss A");
