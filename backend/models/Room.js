import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  hostelName: { type: String, required: true },
  hostelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hostel', required: true },
  block: { type: String, required: true },
  floor: { type: String, required: true },
  roomNumber: { type: String, required: true },
  roomType: { type: String, default: 'Standard' },
  capacity: { type: Number, required: true },
  beds: [{
    bedId: { type: String, required: true }, // e.g. RB-101-A
    status: { type: String, enum: ['AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'UNAVAILABLE'], default: 'AVAILABLE' },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    applicationId: { type: String }
  }]
});

const Room = mongoose.model('Room', roomSchema);
export default Room;
