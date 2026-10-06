import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import User from './models/User.js';

dotenv.config();
dns.setServers(['172.16.1.3']);

const checkDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const warden = await User.findOne({ email: 'demo.warden1@example.com' });
    console.log('Warden:', warden);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
checkDB();
