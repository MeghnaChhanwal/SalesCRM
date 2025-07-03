import mongoose from "mongoose";

// Break subdocument schema
const breakSchema = new mongoose.Schema(
  {
    start: { type: Date },
    end: { type: Date },
  },
  { _id: false } // prevent Mongoose from auto-generating _id for each break
);

// Main Timing schema
const timingSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    date: {
      type: String, // format: "YYYY-MM-DD"
      required: true,
    },
    checkIn: { type: Date },
    checkOut: { type: Date },
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
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (_, ret) => {
        delete ret._id;
        return ret;
      },
    },
  }
);

// Optional: Index for faster querying per employee/day
timingSchema.index({ employee: 1, date: 1 });

const Timing = mongoose.model("Timing", timingSchema);
export default Timing;
