import mongoose from 'mongoose';

const movementSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  hostelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hostel', required: true },
  type: { type: String, enum: ['Outing', 'Leave'], required: true },
  outTime: { type: Date, required: true },
  expectedInTime: { type: Date, required: true },
  actualInTime: { type: Date },
  status: { type: String, enum: ['Outside', 'Late', 'Returned'], default: 'Outside' },
  recordedByOut: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  recordedByIn: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default mongoose.models.Movement || mongoose.model('Movement', movementSchema);
