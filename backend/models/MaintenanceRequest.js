import mongoose from 'mongoose';

const maintenanceSchema = new mongoose.Schema({
  hostelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hostel', required: true },
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  priority: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },
  status: { type: String, enum: ['Pending', 'Assigned', 'In Progress', 'Resolved'], default: 'Pending' },
  assignedTo: { type: String },
  resolutionNote: { type: String },
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  resolvedAt: { type: Date }
}, { timestamps: true });

export default mongoose.models.MaintenanceRequest || mongoose.model('MaintenanceRequest', maintenanceSchema);
