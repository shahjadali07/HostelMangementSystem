import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import Hostel from './models/Hostel.js';
import User from './models/User.js';
import dns from 'dns';

// Fix Node.js DNS resolver
dns.setServers(['172.16.1.3']);

dotenv.config();

const normalizeHostelName = (name) => {
  return name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
};

async function seedInitialWardens() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    const hostels = await Hostel.find();
    if (hostels.length === 0) {
      console.log('No hostels found in database. Run seedHostels.js first.');
      process.exit(1);
    }

    const defaultPassword = 'Shajju@123';
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(defaultPassword, salt);

    let createdCount = 0;

    for (const hostel of hostels) {
      // Check if an active warden already exists for this hostel
      const existingWarden = await User.findOne({
        role: 'WARDEN',
        assignedHostel: hostel._id,
        status: 'ACTIVE'
      });

      if (existingWarden) {
        console.log(`Warden already exists for ${hostel.name} (${existingWarden.email})`);
        continue;
      }

      const normalizedName = normalizeHostelName(hostel.name);
      const email = `mmmut.${normalizedName}@gmail.com`;

      // Also ensure email uniqueness just in case
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        console.log(`Email ${email} already in use. Skipping ${hostel.name}.`);
        continue;
      }

      const newWarden = new User({
        fullName: `${hostel.name} Warden`,
        name: `${hostel.name} Warden`,
        email: email,
        phone: '0000000000',
        passwordHash: passwordHash,
        role: 'WARDEN',
        assignedHostel: hostel._id,
        hostelId: hostel.name, // To match previous mappings
        accountStatus: 'Active',
        status: 'ACTIVE' // Mongoose model uses 'status' mostly, sometimes 'accountStatus'
      });

      await newWarden.save();
      
      // Assign the warden to the hostel
      hostel.wardenId = newWarden._id;
      await hostel.save();

      console.log(`Created Warden for ${hostel.name} -> ${email}`);
      createdCount++;
    }

    console.log(`\nInitialization complete. Created ${createdCount} new warden accounts.`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding initial wardens:', error);
    process.exit(1);
  }
}

seedInitialWardens();
