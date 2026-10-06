import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Hostel from './models/Hostel.js';
import User from './models/User.js';
import dns from 'dns';

// Fix Node.js DNS resolver
dns.setServers(['172.16.1.3']);

dotenv.config();

const BOYS_HOSTELS = [
  { name: "Raman Bhawan", capacity: 500 },
  { name: "Subhash Bhawan", capacity: 455 },
  { name: "Visveswaraya Bhawan", capacity: 320 },
  { name: "Ramanujam Bhawan", capacity: 324 },
  { name: "Tagore Bhawan", capacity: 240 },
  { name: "Ambedkar Bhawan", capacity: 230 },
  { name: "Tilak Bhawan", capacity: 152 }
];

const GIRLS_HOSTELS = [
  { name: "Saraswati Bhawan", capacity: 266 },
  { name: "Kalpana Chawla Bhawan", capacity: 144 },
  { name: "Sarojini Bhawan", capacity: 140 },
  { name: "Kasturba Bhawan", capacity: 140 }
];

async function seedHostelsAndWardens() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');
    
    // Clear existing
    await Hostel.deleteMany({});
    await User.deleteMany({ role: 'WARDEN' });
    console.log('Cleared existing hostels and wardens');

    // Create Wardens
    const ramanWarden = new User({
      fullName: 'Dr. Anita Sharma',
      email: 'warden.raman1@hostel.edu',
      phone: '9811001100',
      passwordHash: 'Warden@123', // Keeping as plain-text mock as in AppContext
      role: 'WARDEN',
      accountStatus: 'Active'
    });
    await ramanWarden.save();
    
    const saraswatiWarden = new User({
      fullName: 'Ms. Priya Nair',
      email: 'warden.saraswati1@hostel.edu',
      phone: '9811003300',
      passwordHash: 'Warden@789',
      role: 'WARDEN',
      accountStatus: 'Active'
    });
    await saraswatiWarden.save();

    // Create Hostels
    const allHostels = [];

    BOYS_HOSTELS.forEach(hostel => {
      allHostels.push({
        name: hostel.name,
        category: 'BOYS',
        capacity: hostel.capacity,
        occupied: Math.floor(Math.random() * (hostel.capacity / 2)),
        wardenId: hostel.name === "Raman Bhawan" ? ramanWarden._id : undefined
      });
    });

    GIRLS_HOSTELS.forEach(hostel => {
      allHostels.push({
        name: hostel.name,
        category: 'GIRLS',
        capacity: hostel.capacity,
        occupied: Math.floor(Math.random() * (hostel.capacity / 2)),
        wardenId: hostel.name === "Saraswati Bhawan" ? saraswatiWarden._id : undefined
      });
    });

    await Hostel.insertMany(allHostels);
    console.log(`Seeded ${allHostels.length} hostels successfully`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding hostels:', error);
    process.exit(1);
  }
}

seedHostelsAndWardens();
