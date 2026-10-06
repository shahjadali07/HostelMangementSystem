import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Hostel from './models/Hostel.js';

import dns from 'dns';

dotenv.config();

// Fix Node.js DNS resolver
dns.setServers(['172.16.1.3']);

const seedWardens = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    // Get a valid hostel
    const hostel = await Hostel.findOne();
    if (!hostel) {
      console.log('No hostels found. Please run seedHostels.js first.');
      process.exit(1);
    }

    const wardens = [
      {
        name: 'Dr. Anita Sharma',
        email: 'warden.raman1@hostel.edu',
        password: 'Warden@123', // Demo plaintext password
        role: 'WARDEN',
        assignedHostel: hostel._id
      }
    ];

    for (const w of wardens) {
      const exists = await User.findOne({ email: w.email });
      if (!exists) {
        await User.create(w);
        console.log(`Created warden ${w.email} assigned to ${hostel.name}`);
      } else {
        console.log(`Warden ${w.email} already exists`);
      }
    }

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedWardens();
