import express from 'express';
import Room from '../models/Room.js';
import Fee from '../models/Fee.js';
import Notification from '../models/Notification.js';

const router = express.Router();

const BOYS_HOSTELS = [
  "Raman Bhawan",
  "Subhash Bhawan",
  "Visveswaraya Bhawan",
  "Tagore Bhawan",
  "Ambedkar Bhawan",
  "Ramanujan Bhawan",
  "Tilak Bhawan"
];

const GIRLS_HOSTELS = [
  "Saraswati Bhawan",
  "Sarojini Bhawan",
  "Kalpana Chawla Bhawan",
  "Kasturba Bhawan"
];

// Seed Rooms
router.post('/seed', async (req, res) => {
  try {
    await Room.deleteMany({});
    
    const generateRoomsForHostels = (hostels, type) => {
      const rooms = [];
      hostels.forEach(hostelName => {
        // Create 2 rooms per hostel for demonstration
        for (let i = 1; i <= 2; i++) {
          rooms.push({
            hostelName,
            block: 'A',
            floor: '1',
            roomNumber: `10${i}`,
            roomType: 'Standard',
            capacity: 2,
            beds: [
              { bedNumber: '1', isOccupied: false },
              { bedNumber: '2', isOccupied: false }
            ]
          });
        }
      });
      return rooms;
    };

    const allRooms = [
      ...generateRoomsForHostels(BOYS_HOSTELS, 'Boys'),
      ...generateRoomsForHostels(GIRLS_HOSTELS, 'Girls')
    ];

    await Room.insertMany(allRooms);
    res.json({ success: true, message: `Seeded ${allRooms.length} rooms successfully.` });
  } catch (error) {
    console.error('Error seeding rooms:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get all rooms and beds, highlighting available ones
router.get('/available', async (req, res) => {
  try {
    const rooms = await Room.find();
    res.json({ success: true, rooms });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get rooms for a specific hostel for Admin
router.get('/hostel/:hostelId', async (req, res) => {
  try {
    const { hostelId } = req.params;
    const rooms = await Room.find({ hostelId }).populate('beds.studentId', 'name email enrollmentNo role');
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


// Allocate a room to a student
router.post('/allocate', async (req, res) => {
  try {
    const { applicationId, studentId, roomId, bedNumber, feeAmount } = req.body;
    
    // Find the room
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    // Find the specific bed
    const bed = room.beds.find(b => b.bedNumber === bedNumber);
    if (!bed) {
      return res.status(404).json({ success: false, message: 'Bed not found' });
    }

    // Check if bed is already occupied
    if (bed.isOccupied) {
      return res.status(400).json({ success: false, message: 'This bed is no longer available. Please select another bed.' });
    }

    // Allocate the bed
    bed.isOccupied = true;
    bed.studentId = studentId;
    bed.applicationId = applicationId;
    await room.save();

    // Create Fee Record (if not exists for this app/student)
    let feeRecord = await Fee.findOne({ studentId, applicationId });
    if (!feeRecord) {
      feeRecord = new Fee({
        studentId,
        applicationId,
        totalFee: feeAmount || 40000, // Default to 40k if not specified
        pendingAmount: feeAmount || 40000,
        status: 'Pending'
      });
      await feeRecord.save();
    }

    // Create Notification
    await Notification.create({
      userId: studentId,
      title: '🏠 Room Allocated',
      message: `Your hostel room has been allocated successfully. Hostel: ${room.hostelName}, Room: ${room.roomNumber}, Bed: ${bed.bedNumber}.`
    });

    res.json({ success: true, message: 'Room allocated successfully', room });
  } catch (error) {
    console.error('Error allocating room:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
