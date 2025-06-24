import mongoose from 'mongoose';

const timingSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  date: { type: String, required: true }, // Format: YYYY-MM-DD (Asia/Kolkata)
  checkIn: { type: String },              // Format: hh:mm A
  checkOut: { type: String },             // Format: hh:mm A
  breaks: [
    {
      start: { type: String },           // break start time
      end: { type: String },             // break end time
      date: { type: String },            // break day in YYYY-MM-DD format (optional but useful if day changes)
    },
  ],
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Inactive',
  },
});

export default mongoose.model('Timing', timingSchema);
