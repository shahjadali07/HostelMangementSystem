import mongoose from 'mongoose';

const feeSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  applicationId: { type: String, required: true },
  totalFee: { type: Number, required: true },
  paidAmount: { type: Number, default: 0 },
  pendingAmount: { type: Number, required: true },
  dueDate: { type: Date },
  status: { type: String, enum: ['Pending', 'Partial', 'Paid'], default: 'Pending' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Fee = mongoose.model('Fee', feeSchema);
export default Fee;
