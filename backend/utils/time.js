import moment from "moment-timezone";

// Current date in YYYY-MM-DD
export const todayIST = () => {
  return moment().tz("Asia/Kolkata").format("YYYY-MM-DD");
};

// Current time in HH:mm:ss format
export const timeIST = () => {
  return moment().tz("Asia/Kolkata").format("HH:mm:ss");
};
