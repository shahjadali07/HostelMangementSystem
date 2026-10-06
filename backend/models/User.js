import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  passwordHash: { type: String, required: false },
  emailVerified: { type: Boolean, default: false },
  emailVerifiedAt: { type: Date },
  role: { type: String, enum: ['STUDENT', 'ADMIN', 'WARDEN'], default: 'STUDENT' },
  accountStatus: { type: String, enum: ['Pending', 'Active'], default: 'Pending' },
  assignedHostel: { type: mongoose.Schema.Types.ObjectId, ref: 'Hostel' },
  hostelId: { type: String }, // To map with frontend 'raman' etc.
  assignedRoom: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
  assignedBed: { type: String },
  allocationStatus: { type: String, enum: ['Pending', 'Allocated'], default: 'Pending' },
  employeeId: { type: String },
  designation: { type: String },
  position: { type: String, enum: ['WARDEN_1', 'WARDEN_2'] },
  status: { type: String, enum: ['ACTIVE', 'INACTIVE', 'DELETED'], default: 'ACTIVE' },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);
export default User;
