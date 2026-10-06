import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import bcrypt from 'bcryptjs';

import User from './models/User.js';
import Hostel from './models/Hostel.js';
import Room from './models/Room.js';
import HostelApplication from './models/HostelApplication.js';
import LeaveRequest from './models/LeaveRequest.js';
import Complaint from './models/Complaint.js';
import MaintenanceRequest from './models/MaintenanceRequest.js';
import Movement from './models/Movement.js';
import Fee from './models/Fee.js';
import Notice from './models/Notice.js';
import Notification from './models/Notification.js';

dotenv.config();
dns.setServers(['172.16.1.3']);

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to Database for seeding...');

    // 1. Idempotency Check & Cleanup
    const isSeeded = await User.findOne({ email: 'demo.aarav@example.com' });
    if (isSeeded) {
      console.log('Demo data already exists. Cleaning up previous demo data...');
      const demoUsers = await User.find({ email: { $regex: '^demo\\.' } });
      const demoUserIds = demoUsers.map(u => u._id);
      
      const allHostels = await Hostel.find();
      const allHostelIds = allHostels.map(h => h._id);

      await HostelApplication.deleteMany({ studentId: { $in: demoUserIds } });
      await LeaveRequest.deleteMany({ studentId: { $in: demoUserIds } });
      await Complaint.deleteMany({ studentId: { $in: demoUserIds } });
      await MaintenanceRequest.deleteMany({ hostelId: { $in: allHostelIds } });
      await Movement.deleteMany({ studentId: { $in: demoUserIds } });
      await Fee.deleteMany({ studentId: { $in: demoUserIds } });
      await Room.deleteMany({ hostelId: { $in: allHostelIds } });
      await Notice.deleteMany({ createdBy: { $in: demoUserIds } });
      await Notification.deleteMany({ userId: { $in: demoUserIds } });
      await Hostel.deleteMany();
      await User.deleteMany({ _id: { $in: demoUserIds } });
      console.log('Cleanup completed.');
    }

    const passwordHash = await bcrypt.hash('Password@123', 10);

    // 2. Create 11 Official Hostels
    console.log('Creating Hostels...');
    const officialHostels = [
      { name: 'Raman Bhawan', category: 'BOYS', capacity: 500 },
      { name: 'Subhash Bhawan', category: 'BOYS', capacity: 455 },
      { name: 'Visvesvaraya Bhawan', category: 'BOYS', capacity: 320 },
      { name: 'Ramanujam Bhawan', category: 'BOYS', capacity: 324 },
      { name: 'Tagore Bhawan', category: 'BOYS', capacity: 240 },
      { name: 'Ambedkar Bhawan', category: 'BOYS', capacity: 230 },
      { name: 'Tilak Bhawan', category: 'BOYS', capacity: 152 },
      { name: 'Saraswati Bhawan', category: 'GIRLS', capacity: 266 },
      { name: 'Kalpana Chawla Bhawan', category: 'GIRLS', capacity: 144 },
      { name: 'Sarojini Bhawan', category: 'GIRLS', capacity: 140 },
      { name: 'Kasturba Bhawan', category: 'GIRLS', capacity: 140 }
    ];
    const createdHostels = await Hostel.insertMany(officialHostels.map(h => ({ ...h, configuredBeds: 0, occupied: 0 })));
    console.log(`Created ${createdHostels.length} hostels.`);

    // 3. Create Wardens for 5 test hostels
    console.log('Creating Wardens...');
    const wardensData = [];
    for (let i = 0; i < 5; i++) {
      const hostel = createdHostels[i];
      wardensData.push({
        fullName: `Warden ${hostel.name.split(' ')[0]}`,
        email: `demo.warden${i + 1}@example.com`,
        phone: `987654321${i}`,
        passwordHash,
        role: 'WARDEN',
        accountStatus: 'Active',
        assignedHostel: hostel._id
      });
    }
    const createdWardens = await User.insertMany(wardensData);
    
    for (let i = 0; i < 5; i++) {
      createdHostels[i].wardenId = createdWardens[i]._id;
      await createdHostels[i].save();
    }
    console.log(`Created ${createdWardens.length} wardens.`);

    // 4. Create Students
    console.log('Creating Students...');
    const studentsData = [
      { fullName: 'Aarav Sharma', email: 'demo.aarav@example.com', phone: '9000000001', role: 'STUDENT', accountStatus: 'Active', passwordHash },
      { fullName: 'Priya Singh', email: 'demo.priya@example.com', phone: '9000000002', role: 'STUDENT', accountStatus: 'Active', passwordHash },
      { fullName: 'Rahul Verma', email: 'demo.rahul@example.com', phone: '9000000003', role: 'STUDENT', accountStatus: 'Active', passwordHash },
      { fullName: 'Ananya Gupta', email: 'demo.ananya@example.com', phone: '9000000004', role: 'STUDENT', accountStatus: 'Active', passwordHash },
      { fullName: 'Aditya Kumar', email: 'demo.aditya@example.com', phone: '9000000005', role: 'STUDENT', accountStatus: 'Active', passwordHash }
    ];
    const createdStudents = await User.insertMany(studentsData);
    console.log(`Created ${createdStudents.length} students.`);

    // 5. Create Applications & Rooms & Operational Data
    console.log('Creating Applications & assigning rooms...');
    
    const statuses = ['APPROVED', 'APPROVED', 'APPROVED', 'NEW', 'REJECTED'];
    
    for (let i = 0; i < createdStudents.length; i++) {
      const student = createdStudents[i];
      const status = statuses[i];
      let hostel, warden;
      if (i < 3) {
        hostel = createdHostels[i % 2]; 
        warden = createdWardens[i % 2];
      } else {
        hostel = createdHostels[4];
        warden = createdWardens[4];
      }

      const appId = `HMS-2026-D${String(i+1).padStart(3, '0')}`;
      
      const app = await HostelApplication.create({
        studentId: student._id,
        id: appId,
        status: status,
        fullName: student.fullName,
        email: student.email,
        phone: student.phone,
        gender: i % 2 === 0 ? 'Male' : 'Female',
        dob: '2004-05-15',
        aadhaar: '123456789012',
        category: 'General',
        department: 'B.Tech',
        course: 'Computer Science',
        year: '2nd Year',
        enrollmentNo: `ENR2026${String(i+1).padStart(3, '0')}`,
        fatherName: `${student.fullName.split(' ')[0]} Father`,
        parentPhone: '9999999999',
        permanentAddress: '123 Demo Street',
        city: 'Demo City',
        state: 'Demo State',
        pincode: '123456',
        hostelAssignmentStatus: status === 'APPROVED' ? 'Allocated' : 'Pending',
        assignedHostel: status === 'APPROVED' ? hostel._id : null,
        assignedWarden: status === 'APPROVED' ? warden._id : null,
        photoUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(student.fullName)}&background=random`
      });

      if (status === 'APPROVED') {
        const hPrefix = hostel.name.split(' ').map(n => n[0]).join(''); // Raman Bhawan -> RB
        const roomNum = `10${i+1}`;
        // Create Room
        const room = await Room.create({
          hostelName: hostel.name,
          hostelId: hostel._id,
          block: 'A',
          floor: '1',
          roomNumber: roomNum,
          capacity: 4,
          beds: [
            { bedId: `${hPrefix}-${roomNum}-A`, status: 'OCCUPIED', studentId: student._id },
            { bedId: `${hPrefix}-${roomNum}-B`, status: 'AVAILABLE' },
            { bedId: `${hPrefix}-${roomNum}-C`, status: 'AVAILABLE' },
            { bedId: `${hPrefix}-${roomNum}-D`, status: 'MAINTENANCE' }
          ]
        });
        
        hostel.configuredBeds += 4;
        hostel.occupied += 1;
        await hostel.save();

        student.assignedHostel = hostel._id;
        student.assignedRoom = room._id;
        student.assignedBed = `${hPrefix}-${roomNum}-A`;
        student.allocationStatus = 'Allocated';
        await student.save();

        app.assignedRoom = room._id;
        app.assignedBed = `${hPrefix}-${roomNum}-A`;
        await app.save();

        // Seed Operational Data
        await LeaveRequest.create({
          studentId: student._id,
          hostelId: hostel._id,
          roomId: room._id,
          leaveType: 'Home',
          startDate: new Date(),
          endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // +3 days
          reason: 'Family Function',
          destinationAddress: 'Demo City',
          contactDuringLeave: '9999999999',
          status: 'Pending'
        });

        await Complaint.create({
          studentId: student._id,
          hostelId: hostel._id,
          roomId: room._id,
          category: 'Electrical',
          description: 'Fan is making too much noise',
          status: 'In Progress'
        });

        await MaintenanceRequest.create({
          hostelId: hostel._id,
          roomId: room._id,
          reportedBy: student._id,
          category: 'Plumbing',
          description: 'Tap leaking',
          priority: 'Medium',
          status: 'Pending'
        });

        await Movement.create({
          studentId: student._id,
          hostelId: hostel._id,
          type: 'Outing',
          outTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hrs ago
          expectedInTime: new Date(Date.now() + 1 * 60 * 60 * 1000),
          status: 'Outside'
        });

        await Fee.create({
          studentId: student._id,
          applicationId: app.id,
          totalFee: 35000,
          paidAmount: 20000,
          pendingAmount: 15000,
          dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
          status: 'Partial'
        });
        
        await Notification.create({
          userId: student._id,
          title: 'Application Approved',
          message: `Your hostel application has been approved and you are assigned to ${hostel.name}.`
        });
      }
    }
    console.log('Seeded operational data (Rooms, Leave, Complaints, Maintenance, Movement, Fee).');

    // 6. Notices
    console.log('Creating Notices...');
    await Notice.create([
      { title: 'Hostel Inspection', description: 'Inspection tomorrow morning.', hostelId: createdHostels[0]._id, createdBy: createdWardens[0]._id, category: 'Inspection' },
      { title: 'Mess Timing Change', description: 'Dinner will be from 8 PM to 10 PM.', createdBy: createdWardens[1]._id, category: 'Mess' }
    ]);
    
    console.log('\n✅ Seeding complete! Demo data is ready.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();
