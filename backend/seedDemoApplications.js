import mongoose from 'mongoose';
import dotenv from 'dotenv';
import HostelApplication from './models/HostelApplication.js';
import User from './models/User.js';
import dns from 'dns';

// Fix Node.js DNS resolver for MongoDB Atlas
dns.setServers(['172.16.1.3']);

dotenv.config();

async function seedDemoApplications() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    const demoStudents = [
      {
        fullName: 'Ravi Kumar',
        email: 'demo.ravi@example.com',
        phone: '9876543201',
        gender: 'Male',
        dob: '2004-05-12',
        aadhaar: '123412341234',
        category: 'General',
        department: 'Computer Science',
        course: 'B.Tech',
        year: '1st Year',
        jeeApplicationNo: 'JEE2024001',
        enrollmentNo: 'ENR2024001',
        fatherName: 'Rajesh Kumar',
        parentPhone: '9988776655',
        permanentAddress: '123 Civil Lines',
        city: 'Lucknow',
        state: 'Uttar Pradesh',
        pincode: '226001',
        status: 'NEW'
      },
      {
        fullName: 'Priya Singh',
        email: 'demo.priya@example.com',
        phone: '9876543202',
        gender: 'Female',
        dob: '2003-08-22',
        aadhaar: '234523452345',
        category: 'OBC',
        department: 'Information Technology',
        course: 'B.Tech',
        year: '2nd Year',
        jeeApplicationNo: 'JEE2023002',
        enrollmentNo: 'ENR2023002',
        fatherName: 'Sanjay Singh',
        parentPhone: '9988776656',
        permanentAddress: '45 MG Road',
        city: 'Kanpur',
        state: 'Uttar Pradesh',
        pincode: '208001',
        status: 'NEW'
      },
      {
        fullName: 'Amit Patel',
        email: 'demo.amit@example.com',
        phone: '9876543203',
        gender: 'Male',
        dob: '2005-01-10',
        aadhaar: '345634563456',
        category: 'SC',
        department: 'Mechanical Engineering',
        course: 'B.Tech',
        year: '1st Year',
        jeeApplicationNo: 'JEE2024003',
        enrollmentNo: 'ENR2024003',
        fatherName: 'Ramesh Patel',
        parentPhone: '9988776657',
        permanentAddress: '78 Ring Road',
        city: 'Varanasi',
        state: 'Uttar Pradesh',
        pincode: '221001',
        status: 'NEW'
      },
      {
        fullName: 'Neha Sharma',
        email: 'demo.neha@example.com',
        phone: '9876543204',
        gender: 'Female',
        dob: '2004-11-05',
        aadhaar: '456745674567',
        category: 'General',
        department: 'Civil Engineering',
        course: 'B.Tech',
        year: '1st Year',
        jeeApplicationNo: 'JEE2024004',
        enrollmentNo: 'ENR2024004',
        fatherName: 'Vijay Sharma',
        parentPhone: '9988776658',
        permanentAddress: '12 Park Street',
        city: 'Agra',
        state: 'Uttar Pradesh',
        pincode: '282001',
        status: 'UNDER REVIEW'
      },
      {
        fullName: 'Siddharth Verma',
        email: 'demo.siddharth@example.com',
        phone: '9876543205',
        gender: 'Male',
        dob: '2003-03-18',
        aadhaar: '567856785678',
        category: 'ST',
        department: 'Electrical Engineering',
        course: 'B.Tech',
        year: '3rd Year',
        jeeApplicationNo: 'JEE2022005',
        enrollmentNo: 'ENR2022005',
        fatherName: 'Anil Verma',
        parentPhone: '9988776659',
        permanentAddress: '89 Main Market',
        city: 'Gorakhpur',
        state: 'Uttar Pradesh',
        pincode: '273001',
        status: 'NEW'
      }
    ];

    let createdCount = 0;

    for (let i = 0; i < demoStudents.length; i++) {
      const demo = demoStudents[i];

      // 1. Create or find User
      let user = await User.findOne({ email: demo.email });
      if (!user) {
        user = new User({
          fullName: demo.fullName,
          email: demo.email,
          phone: demo.phone,
          role: 'STUDENT',
          accountStatus: 'Active'
        });
        await user.save();
      }

      // 2. Create Application
      const existingApp = await HostelApplication.findOne({ email: demo.email });
      if (!existingApp) {
        const count = await HostelApplication.countDocuments();
        const newId = `HMS-2026-${String(count + 1).padStart(4, '0')}`;
        
        await HostelApplication.create({
          studentId: user._id,
          id: newId,
          ...demo
        });
        console.log(`Created application for ${demo.fullName}`);
        createdCount++;
      } else {
        console.log(`Application for ${demo.fullName} already exists. Skipping.`);
      }
    }

    console.log(`\nInitialization complete. Created ${createdCount} total demo applications.`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding demo applications:', error);
    process.exit(1);
  }
}

seedDemoApplications();
