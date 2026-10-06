import express from 'express';
import { authMiddleware, wardenMiddleware } from '../middleware/authMiddleware.js';
import User from '../models/User.js';
import Room from '../models/Room.js';
import HostelApplication from '../models/HostelApplication.js';
import LeaveRequest from '../models/LeaveRequest.js';
import Complaint from '../models/Complaint.js';
import MaintenanceRequest from '../models/MaintenanceRequest.js';
import Movement from '../models/Movement.js';
import DisciplineIncident from '../models/DisciplineIncident.js';
import Notice from '../models/Notice.js';
import HostelAllocation from '../models/HostelAllocation.js';
import mongoose from 'mongoose';

const router = express.Router();

// Apply auth middleware to all warden routes
router.use(authMiddleware, wardenMiddleware);

// Helper to ensure warden only accesses their assigned hostel
const checkHostelMatch = (req, targetHostelId) => {
  return req.user.assignedHostel && req.user.assignedHostel.toString() === targetHostelId?.toString();
};

// 1. DASHBOARD STATS
router.get('/dashboard-stats', async (req, res) => {
  try {
    const hostelId = req.user.assignedHostel;
    
    // Fetch official hostel info
    const hostelInfo = await mongoose.model('Hostel').findById(hostelId);
    
    // Calculate accurate beds via aggregation
    const rooms = await Room.find({ hostelId });
    let configuredBeds = 0;
    let occupiedBeds = 0;
    let availableBeds = 0;
    let maintenanceBeds = 0;
    let unavailableBeds = 0;

    rooms.forEach(room => {
      configuredBeds += room.beds.length;
      room.beds.forEach(bed => {
        if (bed.status === 'OCCUPIED') occupiedBeds++;
        else if (bed.status === 'AVAILABLE') availableBeds++;
        else if (bed.status === 'MAINTENANCE') maintenanceBeds++;
        else if (bed.status === 'UNAVAILABLE') unavailableBeds++;
      });
    });

    const [
      totalStudents,
      pendingLeaves,
      pendingComplaints,
      maintenanceRequests,
      studentsOutside
    ] = await Promise.all([
      User.countDocuments({ role: 'STUDENT', assignedHostel: hostelId }),
      LeaveRequest.countDocuments({ hostelId, status: 'Pending' }),
      Complaint.countDocuments({ hostelId, status: 'Pending' }),
      MaintenanceRequest.countDocuments({ hostelId, status: { $in: ['Pending', 'Assigned', 'In Progress'] } }),
      Movement.countDocuments({ hostelId, status: 'Outside' })
    ]);

    res.json({
      officialCapacity: hostelInfo?.capacity || 0,
      configuredBeds,
      occupiedBeds,
      availableBeds,
      maintenanceBeds,
      unavailableBeds,
      totalStudents,
      pendingLeaves,
      pendingComplaints,
      maintenanceRequests,
      studentsOutside
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats', error: error.message });
  }
});

// 2. STUDENTS
router.get('/students', async (req, res) => {
  try {
    // ---- DUMMY DATA SEEDING (Run only if no approved students exist globally) ----
    const approvedCount = await HostelApplication.countDocuments({ status: 'APPROVED' });
    if (approvedCount === 0) {
      const Hostel = mongoose.model('Hostel');
      
      // Ensure Raman Bhawan and Subhash Bhawan exist
      let raman = await Hostel.findOne({ name: 'Raman Bhawan' });
      if (!raman) raman = await Hostel.create({ name: 'Raman Bhawan', category: 'BOYS', capacity: 200 });
      
      let subhash = await Hostel.findOne({ name: 'Subhash Bhawan' });
      if (!subhash) subhash = await Hostel.create({ name: 'Subhash Bhawan', category: 'BOYS', capacity: 200 });

      const dummyStudents = [
        { name: 'Aman Kumar', phone: '9876543210', email: 'aman.kumar@example.com', year: '1st Year', hostel: raman._id },
        { name: 'Ankit Singh', phone: '9876543211', email: 'ankit.singh@example.com', year: '2nd Year', hostel: raman._id },
        { name: 'Rahul Verma', phone: '9876543212', email: 'rahul.verma@example.com', year: '4th Year', hostel: raman._id },
        { name: 'Priya Sharma', phone: '9876543213', email: 'priya.sharma@example.com', year: '3rd Year', hostel: subhash._id },
        { name: 'Sneha Gupta', phone: '9876543214', email: 'sneha.gupta@example.com', year: '1st Year', hostel: subhash._id }
      ];

      for (let i = 0; i < dummyStudents.length; i++) {
        const dummy = dummyStudents[i];
        
        let user = await User.findOne({ email: dummy.email });
        if (!user) {
          user = new User({
            fullName: dummy.name,
            email: dummy.email,
            phone: dummy.phone,
            role: 'STUDENT',
            accountStatus: 'Active',
            assignedHostel: dummy.hostel
          });
          await user.save();
        }

        const count = await HostelApplication.countDocuments();
        const newId = `HMS-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
        
        await HostelApplication.create({
          studentId: user._id,
          id: newId,
          status: 'APPROVED',
          fullName: dummy.name,
          email: dummy.email,
          phone: dummy.phone,
          gender: i >= 3 ? 'Female' : 'Male',
          dob: '2000-01-01',
          aadhaar: '12345678901' + i,
          category: 'General',
          department: 'Computer Science',
          course: 'B.Tech',
          year: dummy.year,
          enrollmentNo: 'ENR202610' + i,
          fatherName: 'Father ' + dummy.name,
          parentPhone: '999888777' + i,
          permanentAddress: 'Dummy Address',
          city: 'Dummy City',
          state: 'Dummy State',
          pincode: '123456',
          assignedHostel: dummy.hostel,
          hostelAssignmentStatus: 'Assigned'
        });
      }
    }
    // ---- END SEEDING ----

    // Strict Hostel-level access control query through active allocations
    const allocations = await HostelAllocation.find({
      status: 'ACTIVE',
      hostelId: req.user.assignedHostel
    })
      .populate({
        path: 'studentId',
        select: 'fullName email phone enrollmentNo year course department'
      })
      .populate('roomId')
      .populate('hostelId');

    // Format the response to match the frontend expectations (which was using HostelApplication structure)
    // The frontend maps: student._id / student.id, student.fullName, etc.
    const students = allocations.map(allocation => {
      const student = allocation.studentId || {};
      return {
        _id: student._id,
        id: student.enrollmentNo || student._id, // fallback
        studentId: student._id,
        fullName: student.fullName,
        email: student.email,
        phone: student.phone,
        enrollmentNo: student.enrollmentNo,
        year: student.year,
        course: student.course,
        department: student.department,
        assignedHostel: allocation.hostelId, // Need to fetch hostel name if frontend requires it, wait, below
        assignedRoom: allocation.roomId,
        assignedBed: allocation.bedId,
        allocationDate: allocation.allocatedAt,
        status: 'HOSTEL_ALLOCATED',
        submittedAt: allocation.allocatedAt // mapping for frontend displaying registration date
      };
    });

    res.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ message: 'Error fetching students', error: error.message });
  }
});

router.get('/students/:id', async (req, res) => {
  try {
    const allocation = await HostelAllocation.findOne({ 
      studentId: req.params.id, 
      status: 'ACTIVE',
      hostelId: req.user.assignedHostel 
    })
      .populate('roomId')
      .populate('hostelId')
      .populate('studentId');
      
    if (!allocation) return res.status(404).json({ message: 'Student not found in your hostel' });
    
    const student = allocation.studentId || {};
    const formattedStudent = {
      _id: student._id,
      id: student.enrollmentNo || student._id,
      studentId: student._id,
      fullName: student.fullName,
      email: student.email,
      phone: student.phone,
      enrollmentNo: student.enrollmentNo,
      year: student.year,
      course: student.course,
      department: student.department,
      assignedHostel: allocation.hostelId,
      assignedRoom: allocation.roomId,
      assignedBed: allocation.bedId,
      allocationDate: allocation.allocatedAt,
      status: 'HOSTEL_ALLOCATED',
      submittedAt: allocation.allocatedAt
    };

    res.json(formattedStudent);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching student', error: error.message });
  }
});

// 3. ROOMS
router.get('/rooms', async (req, res) => {
  try {
    const rooms = await Room.find({ hostelId: req.user.assignedHostel })
      .populate('beds.studentId', 'name email enrollmentNo');
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching rooms', error: error.message });
  }
});


// 3.5 BED ALLOCATION
router.get('/rooms/available-for-allocation', async (req, res) => {
  try {
    // Find rooms in this hostel that have at least one AVAILABLE bed
    const rooms = await Room.find({ 
      hostelId: req.user.assignedHostel,
      'beds.status': 'AVAILABLE'
    });
    
    // Filter the beds array to only return AVAILABLE beds
    const availableRooms = rooms.map(room => {
      const availableBeds = room.beds.filter(b => b.status === 'AVAILABLE');
      return {
        _id: room._id,
        roomNumber: room.roomNumber,
        block: room.block,
        floor: room.floor,
        totalBeds: room.capacity,
        availableBeds
      };
    });
    
    res.json(availableRooms);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching available rooms', error: error.message });
  }
});

router.post('/allocate-bed', async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { applicationId, studentId, roomId, bedId } = req.body;
    const hostelId = req.user.assignedHostel;

    // 13. Prevent duplicate active allocation
    const existingAllocation = await HostelAllocation.findOne({
      studentId: studentId,
      status: 'ACTIVE'
    }).session(session);

    if (existingAllocation) {
      throw new Error('This student already has an active hostel allocation.');
    }

    // Verify application
    const app = await HostelApplication.findOne({ id: applicationId, assignedHostel: hostelId }).session(session);
    if (!app) throw new Error('Application not found or not assigned to your hostel');
    
    // Validate Room belongs to the warden's hostel
    const room = await Room.findOne({ _id: roomId, hostelId: hostelId }).session(session);
    if (!room) throw new Error('Room not found in this hostel.');
    
    // Check if bed is available
    const bed = room.beds.find(b => b.bedId === bedId);
    if (!bed) throw new Error('Bed not found in this room.');
    if (bed.status !== 'AVAILABLE') throw new Error('This bed is no longer available.');

    // 1. Update Bed to OCCUPIED
    const updatedRoom = await Room.findOneAndUpdate(
      { 
        _id: roomId, 
        hostelId: hostelId,
        'beds': { $elemMatch: { bedId: bedId, status: 'AVAILABLE' } }
      },
      { 
        $set: { 
          'beds.$.status': 'OCCUPIED', 
          'beds.$.studentId': studentId,
          'beds.$.applicationId': applicationId
        }
      },
      { new: true, session }
    );

    if (!updatedRoom) {
      throw new Error('This bed is no longer available. Please select another bed.');
    }

    // 2. Create Active Hostel Allocation
    const newAllocation = new HostelAllocation({
      studentId,
      hostelId,
      roomId,
      bedId,
      status: 'ACTIVE',
      allocatedBy: req.user.id
    });
    await newAllocation.save({ session });

    // 3. Update Application
    app.status = 'BED_ALLOCATED';
    app.hostelAssignmentStatus = 'Allocated';
    app.assignedRoom = roomId;
    app.assignedBed = bedId;
    app.assignedAt = new Date();
    await app.save({ session });

    // 4. Update Student User
    await User.findByIdAndUpdate(studentId, {
      assignedRoom: roomId,
      assignedBed: bedId,
      allocationStatus: 'Allocated' // Equivalent to HOSTEL_ALLOCATED
    }, { session });

    // 5. Update Hostel Occupancy
    await mongoose.model('Hostel').findByIdAndUpdate(hostelId, {
      $inc: { occupied: 1 }
    }, { session });

    await session.commitTransaction();
    session.endSession();

    res.json({ message: 'Bed allocated successfully', room: updatedRoom });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ message: 'Error allocating bed', error: error.message });
  }
});

router.post('/change-room', async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { studentId, oldRoomId, oldBedId, newRoomId, newBedId } = req.body;
    const hostelId = req.user.assignedHostel;

    // 1. Verify student and application
    const student = await User.findOne({ _id: studentId, assignedHostel: hostelId, role: 'STUDENT' }).session(session);
    if (!student) throw new Error('Student not found in your hostel');

    const app = await HostelApplication.findOne({ studentId: student._id, assignedHostel: hostelId }).session(session);
    if (!app) throw new Error('Application not found');

    const allocation = await HostelAllocation.findOne({ studentId: student._id, status: 'ACTIVE' }).session(session);
    if (!allocation) throw new Error('Active allocation not found');

    // 2. Atomic Bed Allocation for new room
    const newRoom = await Room.findOneAndUpdate(
      { 
        _id: newRoomId, 
        hostelId: hostelId,
        'beds': { $elemMatch: { bedId: newBedId, status: 'AVAILABLE' } }
      },
      { 
        $set: { 
          'beds.$.status': 'OCCUPIED', 
          'beds.$.studentId': studentId,
          'beds.$.applicationId': app.id
        }
      },
      { new: true, session }
    );

    if (!newRoom) {
      throw new Error('The selected new bed is no longer available.');
    }

    // 3. Free up the old bed
    await Room.findOneAndUpdate(
      { 
        _id: oldRoomId, 
        hostelId: hostelId,
        'beds.bedId': oldBedId 
      },
      { 
        $set: { 
          'beds.$.status': 'AVAILABLE', 
          'beds.$.studentId': null,
          'beds.$.applicationId': null
        }
      },
      { session }
    );

    // 4. Update Student User
    student.assignedRoom = newRoomId;
    student.assignedBed = newBedId;
    await student.save({ session });

    // 5. Update Application
    app.assignedRoom = newRoomId;
    app.assignedBed = newBedId;
    await app.save({ session });

    // 6. Update Allocation
    allocation.roomId = newRoomId;
    allocation.bedId = newBedId;
    await allocation.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.json({ message: 'Room changed successfully', room: newRoom });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ message: 'Error changing room', error: error.message });
  }
});

// 4. LEAVE REQUESTS
router.get('/leave-requests', async (req, res) => {
  try {
    const requests = await LeaveRequest.find({ hostelId: req.user.assignedHostel })
      .populate('studentId', 'name enrollmentNo')
      .populate('roomId', 'roomNumber block floor')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching leave requests', error: error.message });
  }
});

router.put('/leave-requests/:id/status', async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    const request = await LeaveRequest.findOneAndUpdate(
      { _id: req.params.id, hostelId: req.user.assignedHostel },
      { status, rejectionReason, approvedBy: req.user.id, approvedAt: Date.now() },
      { new: true }
    );
    if (!request) return res.status(404).json({ message: 'Leave request not found' });
    res.json(request);
  } catch (error) {
    res.status(500).json({ message: 'Error updating leave request', error: error.message });
  }
});

// 5. COMPLAINTS
router.get('/complaints', async (req, res) => {
  try {
    const complaints = await Complaint.find({ hostelId: req.user.assignedHostel })
      .populate('studentId', 'name enrollmentNo')
      .populate('roomId', 'roomNumber block floor')
      .sort({ createdAt: -1 });
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching complaints', error: error.message });
  }
});

router.put('/complaints/:id/status', async (req, res) => {
  try {
    const { status, internalNote } = req.body;
    const complaint = await Complaint.findOneAndUpdate(
      { _id: req.params.id, hostelId: req.user.assignedHostel },
      { status, internalNote, resolvedBy: status === 'Resolved' ? req.user.id : null, resolvedAt: status === 'Resolved' ? Date.now() : null },
      { new: true }
    );
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
    res.json(complaint);
  } catch (error) {
    res.status(500).json({ message: 'Error updating complaint', error: error.message });
  }
});

// 6. MOVEMENT
router.get('/movement', async (req, res) => {
  try {
    const movements = await Movement.find({ hostelId: req.user.assignedHostel })
      .populate('studentId', 'name enrollmentNo')
      .sort({ createdAt: -1 });
    res.json(movements);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching movement records', error: error.message });
  }
});

router.post('/movement', async (req, res) => {
  try {
    const { studentId, type, expectedInTime } = req.body;
    const movement = new Movement({
      studentId,
      hostelId: req.user.assignedHostel,
      type,
      outTime: Date.now(),
      expectedInTime,
      status: 'Outside',
      recordedByOut: req.user.id
    });
    await movement.save();
    res.status(201).json(movement);
  } catch (error) {
    res.status(500).json({ message: 'Error recording movement', error: error.message });
  }
});

router.put('/movement/:id/return', async (req, res) => {
  try {
    const movement = await Movement.findOneAndUpdate(
      { _id: req.params.id, hostelId: req.user.assignedHostel },
      { 
        actualInTime: Date.now(), 
        status: 'Returned',
        recordedByIn: req.user.id
      },
      { new: true }
    );
    if (!movement) return res.status(404).json({ message: 'Movement record not found' });
    res.json(movement);
  } catch (error) {
    res.status(500).json({ message: 'Error updating movement', error: error.message });
  }
});

// 7. MAINTENANCE
router.get('/maintenance', async (req, res) => {
  try {
    const requests = await MaintenanceRequest.find({ hostelId: req.user.assignedHostel })
      .populate('reportedBy', 'name role')
      .populate('roomId', 'roomNumber block floor')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching maintenance requests', error: error.message });
  }
});

router.put('/maintenance/:id/status', async (req, res) => {
  try {
    const { status, resolutionNote, assignedTo } = req.body;
    const request = await MaintenanceRequest.findOneAndUpdate(
      { _id: req.params.id, hostelId: req.user.assignedHostel },
      { status, resolutionNote, assignedTo, resolvedBy: status === 'Resolved' ? req.user.id : null, resolvedAt: status === 'Resolved' ? Date.now() : null },
      { new: true }
    );
    if (!request) return res.status(404).json({ message: 'Maintenance request not found' });
    res.json(request);
  } catch (error) {
    res.status(500).json({ message: 'Error updating maintenance', error: error.message });
  }
});

// 8. DISCIPLINE
router.get('/discipline', async (req, res) => {
  try {
    const incidents = await DisciplineIncident.find({ hostelId: req.user.assignedHostel })
      .populate('studentId', 'name enrollmentNo')
      .populate('reportedBy', 'name role')
      .sort({ date: -1 });
    res.json(incidents);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching discipline incidents', error: error.message });
  }
});

router.post('/discipline', async (req, res) => {
  try {
    const { studentId, incidentType, date, time, description, severity, actionTaken, additionalNotes } = req.body;
    const incident = new DisciplineIncident({
      studentId,
      hostelId: req.user.assignedHostel,
      reportedBy: req.user.id,
      incidentType,
      date,
      time,
      description,
      severity,
      actionTaken,
      additionalNotes
    });
    await incident.save();
    res.status(201).json(incident);
  } catch (error) {
    res.status(500).json({ message: 'Error recording incident', error: error.message });
  }
});

// 9. NOTICES
router.get('/notices', async (req, res) => {
  try {
    // Get hostel specific notices and global notices
    const notices = await Notice.find({
      $or: [{ hostelId: req.user.assignedHostel }, { hostelId: null }]
    })
      .populate('createdBy', 'name role')
      .sort({ isPinned: -1, publishDate: -1 });
    res.json(notices);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notices', error: error.message });
  }
});

router.post('/notices', async (req, res) => {
  try {
    const { title, description, category, priority, expiryDate, isPinned } = req.body;
    const notice = new Notice({
      title,
      description,
      category,
      priority,
      expiryDate,
      isPinned,
      hostelId: req.user.assignedHostel,
      createdBy: req.user.id
    });
    await notice.save();
    res.status(201).json(notice);
  } catch (error) {
    res.status(500).json({ message: 'Error creating notice', error: error.message });
  }
});

export default router;
