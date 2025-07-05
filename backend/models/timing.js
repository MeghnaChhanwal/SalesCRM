const timingSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
  date: String, // YYYY-MM-DD
  checkIn: String,
  checkOut: String,
  status: { type: String, enum: ["Active", "Inactive"] },
  breakStatus: { type: String, enum: ["OnBreak", "OffBreak"] },
  breaks: [{ start: String, end: String }],
});
