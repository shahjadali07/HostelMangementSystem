import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otpHash: { type: String, required: false },
  expiresAt: { type: Date, required: true },
  attempts: { type: Number, default: 0 },
  verified: { type: Boolean, default: false }
});

otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const OTP = mongoose.model('OTP', otpSchema);
export default OTP;
