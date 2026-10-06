import mongoose from 'mongoose';

const disciplineSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  hostelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hostel', required: true },
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  incidentType: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  description: { type: String, required: true },
  severity: { type: String, enum: ['Minor', 'Moderate', 'Serious', 'Critical'], required: true },
  actionTaken: { type: String, enum: ['Warning', 'Counselling', 'Fine/Action Reference', 'Escalated to Admin', 'Other'], required: true },
  additionalNotes: { type: String }
}, { timestamps: true });

export default mongoose.models.DisciplineIncident || mongoose.model('DisciplineIncident', disciplineSchema);
