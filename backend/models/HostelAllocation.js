import mongoose from 'mongoose';

const hostelAllocationSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  hostelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hostel', required: true },
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  bedId: { type: String, required: true },
  status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
  allocatedAt: { type: Date, default: Date.now },
  allocatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const HostelAllocation = mongoose.model('HostelAllocation', hostelAllocationSchema);
export default HostelAllocation;
