import mongoose from 'mongoose';

const timingSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  date: { type: String, required: true }, // Format: YYYY-MM-DD
  checkIn: String,
  checkOut: String,
  breaks: [{ start: String, end: String }],
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Inactive' },
});

export default mongoose.model('Timing', timingSchema);
