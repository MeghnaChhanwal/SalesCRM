// utils/time.js
export const todayIST = () => {
  const now = new Date();
  now.setUTCHours(now.getUTCHours() + 5.5);
  return now.toISOString().split("T")[0]; // YYYY-MM-DD
};

export const timeIST = () => {
  const now = new Date();
  now.setUTCHours(now.getUTCHours() + 5.5);
  return now.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};
