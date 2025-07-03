import moment from "moment-timezone";

export const todayIST = () => moment().tz("Asia/Kolkata").format("YYYY-MM-DD");
export const timeIST = () => moment().tz("Asia/Kolkata").format("HH:mm");
