import mongoose from 'mongoose';

const noticeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  hostelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hostel' }, // null means global
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: String, enum: ['General', 'Mess', 'Maintenance', 'Meeting', 'Inspection', 'Emergency', 'Other'], default: 'General' },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Low' },
  publishDate: { type: Date, default: Date.now },
  expiryDate: { type: Date },
  isPinned: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.models.Notice || mongoose.model('Notice', noticeSchema);
