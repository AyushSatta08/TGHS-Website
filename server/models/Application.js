import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 254,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    role: { type: String, required: true, trim: true, maxlength: 120 },
    status: {
      type: String,
      enum: ['New', 'Screening', 'Interview', 'Offer', 'Hired', 'Rejected'],
      default: 'New',
    },
    notes: { type: String, trim: true, maxlength: 2000, default: '' },
  },
  { timestamps: true },
);

export default mongoose.model('Application', applicationSchema);
