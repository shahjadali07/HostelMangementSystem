import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Room from './models/Room.js';
import Hostel from './models/Hostel.js';
import dns from 'dns';

// Fix Node.js DNS resolver
dns.setServers(['172.16.1.3']);

dotenv.config();

async function seedRooms() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    const hostels = await Hostel.find();
    if (hostels.length === 0) {
      console.log('No hostels found in database. Run seedHostels.js first.');
      process.exit(1);
    }

    let createdCount = 0;

    for (const hostel of hostels) {
      // Idempotency check: if rooms exist for this hostel, skip
      const existingRoomsCount = await Room.countDocuments({ hostelId: hostel._id });
      if (existingRoomsCount > 0) {
        console.log(`Rooms already exist for ${hostel.name} (${existingRoomsCount} rooms). Skipping.`);
        continue;
      }

      console.log(`Generating rooms for ${hostel.name}... (Capacity: ${hostel.capacity})`);

      const totalRooms = Math.ceil(hostel.capacity / 4);
      const groundFloorRoomsCount = Math.ceil(totalRooms / 2);
      const firstFloorRoomsCount = Math.floor(totalRooms / 2);

      let currentBedCount = 0;
      let roomConfigs = [];

      // Generate Ground Floor Rooms
      for (let i = 1; i <= groundFloorRoomsCount; i++) {
        let roomNumber = `1${String(i).padStart(2, '0')}`;
        let roomCapacity = 4;
        
        if (currentBedCount + 4 > hostel.capacity) {
          roomCapacity = hostel.capacity - currentBedCount;
        }

        if (roomCapacity > 0) {
          roomConfigs.push({
            floor: 0,
            roomNumber: roomNumber,
            capacity: roomCapacity
          });
          currentBedCount += roomCapacity;
        }
      }

      // Generate First Floor Rooms
      for (let i = 1; i <= firstFloorRoomsCount; i++) {
        let roomNumber = `2${String(i).padStart(2, '0')}`;
        let roomCapacity = 4;

        if (currentBedCount + 4 > hostel.capacity) {
          roomCapacity = hostel.capacity - currentBedCount;
        }

        if (roomCapacity > 0) {
          roomConfigs.push({
            floor: 1,
            roomNumber: roomNumber,
            capacity: roomCapacity
          });
          currentBedCount += roomCapacity;
        }
      }

      // Insert all generated rooms into DB
      const roomsToInsert = roomConfigs.map(config => {
        // Generate bed array
        const beds = [];
        for (let b = 1; b <= config.capacity; b++) {
          beds.push({
            bedId: `${hostel.name.substring(0, 3).toUpperCase()}-${config.roomNumber}-${b}`,
            status: 'AVAILABLE',
            studentId: null
          });
        }

        return {
          hostelName: hostel.name,
          hostelId: hostel._id,
          block: 'Main',
          floor: config.floor,
          roomNumber: config.roomNumber,
          capacity: config.capacity,
          beds: beds
        };
      });

      await Room.insertMany(roomsToInsert);
      createdCount += roomsToInsert.length;
      console.log(`-> Created ${roomsToInsert.length} rooms for ${hostel.name} (Total beds: ${currentBedCount}).`);
    }

    console.log(`\nInitialization complete. Created ${createdCount} total new rooms.`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding rooms:', error);
    process.exit(1);
  }
}

seedRooms();
