


export const todayIST = () => {
  const now = new Date();
  now.setTime(now.getTime() + 5.5 * 60 * 60 * 1000); 
  return now.toISOString().split("T")[0]; 
};


export const timeIST = () => {
  const now = new Date();
  now.setTime(now.getTime() + 5.5 * 60 * 60 * 1000); 
  return now
    .toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
    .toUpperCase(); 
};
