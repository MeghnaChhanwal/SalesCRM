// utils/time.js
import moment from "moment-timezone";

// IST मध्ये आजची तारीख yyyy-MM-DD format मध्ये (उदा. 2025-07-04)
export const todayIST = () => {
  return moment().tz("Asia/Kolkata").format("YYYY-MM-DD");
};


export const timeIST = () => {
  return moment().tz("Asia/Kolkata").format("HH:mm:ss");
};

export const nowISTDate = () => {
  return moment().tz("Asia/Kolkata").toDate();
};

export const formatTimeIST12h = (date) => {
  return moment(date).tz("Asia/Kolkata").format("hh:mm A");
};
