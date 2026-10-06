import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  hostelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hostel', required: true },
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
  category: { type: String, enum: ['Electrical', 'Plumbing', 'Room', 'Mess', 'Cleanliness', 'Internet', 'Security', 'Other'], required: true },
  description: { type: String, required: true },
  priority: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },
  status: { type: String, enum: ['Pending', 'In Progress', 'Resolved', 'Rejected'], default: 'Pending' },
  internalNote: { type: String },
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  resolvedAt: { type: Date }
}, { timestamps: true });

export default mongoose.models.Complaint || mongoose.model('Complaint', complaintSchema);
