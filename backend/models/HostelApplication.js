import mongoose from 'mongoose';

const hostelApplicationSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  id: { type: String, required: true, unique: true }, // e.g., HMS-2026-0001
  status: { type: String, enum: ['NEW', 'UNDER REVIEW', 'APPROVED', 'ASSIGNED TO WARDEN', 'REJECTED', 'FORWARDED_TO_WARDEN', 'BED_ALLOCATION_PENDING', 'BED_ALLOCATED', 'CANCELLED'], default: 'NEW' },
  submittedAt: { type: Date, default: Date.now },

  // Personal Info
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  gender: { type: String, required: true },
  dob: { type: String, required: true },
  aadhaar: { type: String, required: true },
  category: { type: String, required: true },

  // Academic Info
  department: { type: String, required: true },
  course: { type: String }, // To map to frontend 'course' property
  year: { type: String, required: true },
  jeeApplicationNo: { type: String },
  cuetApplicationNo: { type: String },
  enrollmentNo: { type: String },

  // Parent & Address
  fatherName: { type: String, required: true },
  motherName: { type: String },
  parentPhone: { type: String, required: true },
  parentEmail: { type: String },
  permanentAddress: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },

  // Documents (file paths)
  photoUrl: { type: String },
  signatureUrl: { type: String },
  aadhaarDocUrl: { type: String },
  otherDocumentsUrls: [{ type: String }],
  
  // Review Metadata
  rejectionReason: { type: String },
  correctionMessage: { type: String },
  reviewedDate: { type: Date },
  reviewedBy: { type: String },

  // Assignment Metadata
  hostelAssignmentStatus: { type: String, enum: ['Pending', 'Assigned', 'Allocated'], default: 'Pending' },
  assignedHostel: { type: mongoose.Schema.Types.ObjectId, ref: 'Hostel' },
  assignedWarden: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignedRoom: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
  assignedBed: { type: String },
  assignedAt: { type: Date }
});

const HostelApplication = mongoose.model('HostelApplication', hostelApplicationSchema);
export default HostelApplication;
