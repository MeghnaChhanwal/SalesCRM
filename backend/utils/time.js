


export const todayIST = () => {
  const now = new Date();
  now.setTime(now.getTime() + 5.5 * 60 * 60 * 1000); 
  return now.toISOString().split("T")[0]; 
};

// ✅ Return current time in IST (HH:MM AM/PM format with capital AM/PM)
export const timeIST = () => {
  const now = new Date();
  now.setTime(now.getTime() + 5.5 * 60 * 60 * 1000); // add 5.5 hours for IST
  return now
    .toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
    .toUpperCase(); // ensures AM/PM is capital
};
