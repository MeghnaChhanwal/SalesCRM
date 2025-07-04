// ✅ Returns today's date in IST timezone in format YYYY-MM-DD
export const todayIST = () => {
  const now = new Date();
  now.setTime(now.getTime() + 5.5 * 60 * 60 * 1000); // add 5.5 hours to UTC
  return now.toISOString().split("T")[0];
};

export const timeIST = () => {
  const now = new Date();
  now.setTime(now.getTime() + 5.5 * 60 * 60 * 1000); // add 5.5 hours to UTC
  return now.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};
