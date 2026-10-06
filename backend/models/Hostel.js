import mongoose from 'mongoose';

const hostelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, enum: ['BOYS', 'GIRLS'], required: true },
  capacity: { type: Number, default: 0 }, // Official Capacity
  configuredBeds: { type: Number, default: 0 }, // Total physical beds created
  occupied: { type: Number, default: 0 },
  wardenId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Warden assigned to this hostel
  createdAt: { type: Date, default: Date.now }
});

const Hostel = mongoose.model('Hostel', hostelSchema);
export default Hostel;
