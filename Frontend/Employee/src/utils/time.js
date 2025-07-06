// ✅ Returns current date in IST timezone (YYYY-MM-DD)
export const todayIST = () => {
  const now = new Date();
  now.setTime(now.getTime() + 5.5 * 60 * 60 * 1000); // UTC ➜ IST
  return now.toISOString().split("T")[0];
};

// ✅ Returns current time in IST (HH:MM AM/PM)
export const timeIST = () => {
  const now = new Date();
  now.setTime(now.getTime() + 5.5 * 60 * 60 * 1000); // UTC ➜ IST
  return now.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};
