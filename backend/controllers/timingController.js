export const getTodayTiming = async (req, res) => {
  const { id } = req.params;
  const date = todayIST();

  try {
    const timing = await Timing.findOne({ employee: id, date });
    res.status(200).json([timing]);
  } catch (err) {
    console.error("Get timing error:", err);
    res.status(500).json({ error: "Failed to fetch timing" });
  }
};