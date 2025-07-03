const breakSchema = new mongoose.Schema({
  start: { type: Date },  // full ISO date-time
  end: { type: Date },
}, { _id: false });

const timingSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true,
  },
  date: {
    type: String, // still fine for grouping: YYYY-MM-DD
    required: true,
  },
  checkIn: {
    type: Date, // changed from String
  },
  checkOut: {
    type: Date, // changed from String
  },
  status: {
    type: String,
    enum: ["Active", "Inactive"],
    default: "Inactive",
  },
  breakStatus: {
    type: String,
    enum: ["OnBreak", "OffBreak"],
    default: "OffBreak",
  },
  breaks: [breakSchema],
}, { timestamps: true });
