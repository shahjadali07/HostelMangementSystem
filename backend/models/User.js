import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  passwordHash: { type: String, required: false }, // optional for now since they are creating account at registration
  role: { type: String, enum: ['STUDENT', 'ADMIN', 'WARDEN'], default: 'STUDENT' },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);
export default User;
