import express from 'express';
import multer from 'multer';
import path from 'path';
import mongoose from 'mongoose';
import User from '../models/User.js';
import HostelApplication from '../models/HostelApplication.js';
import Notification from '../models/Notification.js';

const router = express.Router();

// Set up Multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Ensure this directory exists
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Define the fields to upload
const cpUpload = upload.fields([
  { name: 'photo', maxCount: 1 },
  { name: 'signature', maxCount: 1 },
  { name: 'aadhaarDoc', maxCount: 1 },
  { name: 'documents', maxCount: 10 }
]);

router.post('/register', cpUpload, async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({ success: false, message: 'Unable to connect to the database. Please try again later.' });
    }

    const {
      fullName, gender, dob, phone, email, aadhaar, category,
      department, year, jeeApplicationNo, cuetApplicationNo, enrollmentNo,
      fatherName, motherName, parentPhone, parentEmail, permanentAddress, city, state, pincode
    } = req.body;

    // Check for duplicate application
    const searchCriteria = [{ email }, { aadhaar }];
    if (enrollmentNo) {
      searchCriteria.push({ enrollmentNo });
    }
    const existingApp = await HostelApplication.findOne({ $or: searchCriteria });
    if (existingApp) {
      return res.status(409).json({ success: false, message: 'Application already exists' });
    }

    // Check if user already exists
    let user = await User.findOne({ email });
    if (!user) {
      // Create user account
      user = new User({
        fullName,
        email,
        phone,
        role: 'STUDENT'
        // passwordHash will be added later when we implement login/signup flows properly
      });
      await user.save();
    }

    // Generate Application ID (e.g., HMS-2026-XXXX)
    const count = await HostelApplication.countDocuments();
    const newId = `HMS-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    // Get uploaded file paths
    const photoUrl = req.files && req.files['photo'] ? req.files['photo'][0].path : null;
    const signatureUrl = req.files && req.files['signature'] ? req.files['signature'][0].path : null;
    const aadhaarDocUrl = req.files && req.files['aadhaarDoc'] ? req.files['aadhaarDoc'][0].path : null;
    const otherDocumentsUrls = req.files && req.files['documents'] ? req.files['documents'].map(f => f.path) : [];

    // Create application
    const application = new HostelApplication({
      studentId: user._id,
      id: newId,
      status: 'NEW',
      fullName,
      email,
      phone,
      gender,
      dob,
      aadhaar,
      category,
      department,
      course: department, // Mapping for frontend
      year,
      jeeApplicationNo,
      cuetApplicationNo,
      enrollmentNo,
      fatherName,
      motherName,
      parentPhone,
      parentEmail,
      permanentAddress,
      city,
      state,
      pincode,
      photoUrl,
      signatureUrl,
      aadhaarDocUrl,
      otherDocumentsUrls
    });

    await application.save();

    res.status(201).json({ success: true, message: 'Registration submitted successfully', application });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ success: false, message: 'Unable to create application' });
  }
});

// Endpoint for Admin to fetch approved students (with dummy data generation)
router.get('/admin/approved-students', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({ success: false, message: 'Database disconnected' });
    }
    
    let applications = await HostelApplication.find({ status: 'APPROVED' }).sort({ fullName: 1 });
    
    // Seed dummy data if none exist
    if (applications.length === 0) {
      const dummyData = [
        { name: 'Aman Kumar', phone: '9876543210', email: 'aman.kumar@example.com', year: '1st Year' },
        { name: 'Ankit Singh', phone: '9876543211', email: 'ankit.singh@example.com', year: '2nd Year' },
        { name: 'Priya Sharma', phone: '9876543212', email: 'priya.sharma@example.com', year: '3rd Year' },
        { name: 'Rahul Verma', phone: '9876543213', email: 'rahul.verma@example.com', year: '4th Year' },
        { name: 'Sneha Gupta', phone: '9876543214', email: 'sneha.gupta@example.com', year: '1st Year' }
      ];

      for (let i = 0; i < dummyData.length; i++) {
        const dummy = dummyData[i];
        
        // Ensure no duplicate users
        let user = await User.findOne({ email: dummy.email });
        if (!user) {
          user = new User({
            fullName: dummy.name,
            email: dummy.email,
            phone: dummy.phone,
            role: 'STUDENT',
            accountStatus: 'Active'
          });
          await user.save();
        }

        const count = await HostelApplication.countDocuments();
        const newId = `HMS-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
        
        const app = new HostelApplication({
          studentId: user._id,
          id: newId,
          status: 'APPROVED',
          fullName: dummy.name,
          email: dummy.email,
          phone: dummy.phone,
          gender: i % 2 === 0 ? 'Male' : 'Female',
          dob: '2000-01-01',
          aadhaar: '12345678901' + i,
          category: 'General',
          department: 'Computer Science',
          course: 'B.Tech',
          year: dummy.year,
          enrollmentNo: 'ENR202600' + i,
          fatherName: 'Father ' + dummy.name,
          parentPhone: '999888777' + i,
          permanentAddress: 'Dummy Address',
          city: 'Dummy City',
          state: 'Dummy State',
          pincode: '123456'
        });
        
        await app.save();
        applications.push(app);
      }
      
      // Sort the newly created dummy data
      applications.sort((a, b) => a.fullName.toLowerCase().localeCompare(b.fullName.toLowerCase()));
    }
    
    res.json(applications);
  } catch (error) {
    console.error('Error fetching approved students:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Endpoint for Admin to fetch all applications
router.get('/', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({ success: false, message: 'Database disconnected' });
    }
    const applications = await HostelApplication.find().sort({ submittedAt: -1 });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Endpoint to fetch a single application by ID
router.get('/:id', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({ success: false, message: 'Database disconnected' });
    }
    const application = await HostelApplication.findOne({ id: req.params.id });
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }
    res.json(application);
  } catch (error) {
    console.error('Error fetching application:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Endpoint to update application status
router.put('/:id/status', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({ success: false, message: 'Database disconnected' });
    }
    const { status, rejectionReason, correctionMessage } = req.body;
    const application = await HostelApplication.findOne({ id: req.params.id });
    
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    application.status = status;
    application.reviewedDate = new Date();
    // Use an admin ID if available in a real app. We'll just hardcode 'Admin' for now.
    application.reviewedBy = 'Admin'; 

    if (status === 'REJECTED') {
      application.rejectionReason = rejectionReason;
      application.correctionMessage = undefined;
    } else if (status === 'CORRECTION REQUIRED') {
      application.correctionMessage = correctionMessage;
      application.rejectionReason = undefined;
    } else if (status === 'APPROVED') {
      application.rejectionReason = undefined;
      application.correctionMessage = undefined;
      
      // Activate User Account
      const user = await User.findById(application.studentId);
      if (user) {
        user.accountStatus = 'Active';
        await user.save();
        
        // Send Notification
        await Notification.create({
          userId: user._id,
          title: '🎉 Application Approved',
          message: 'Your hostel application has been approved. Please check your dashboard for further hostel and room allocation details.'
        });
      }
    } else {
      application.rejectionReason = undefined;
      application.correctionMessage = undefined;
    }

    await application.save();
    res.json({ success: true, message: 'Application status updated successfully', application });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Endpoint to assign hostel to an application
router.post('/:id/assign-hostel', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({ success: false, message: 'Database disconnected' });
    }
    const { hostelId } = req.body;
    
    // Find application
    const application = await HostelApplication.findOne({ id: req.params.id });
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    // Find hostel
    const mongooseHostel = (await import('../models/Hostel.js')).default;
    const hostel = await mongooseHostel.findById(hostelId).populate('wardenId');
    if (!hostel) {
      return res.status(404).json({ success: false, message: 'Hostel not found' });
    }

    // Check if hostel has a warden
    if (!hostel.wardenId) {
      return res.status(400).json({ success: false, message: 'No warden is currently assigned to this hostel. Please assign a warden before sending this application.' });
    }

    // Check if already assigned


    if (application.assignedWarden) {


      return res.status(409).json({ success: false, message: 'This application is already assigned to a Warden.' });


    }


    // Assign application


    application.status = 'ASSIGNED TO WARDEN';
    application.hostelAssignmentStatus = 'Assigned';
    application.assignedHostel = hostel._id;
    application.assignedWarden = hostel.wardenId._id;
    application.assignedAt = new Date();

    await application.save();

    // Create Notification for Student
    await Notification.create({
      userId: application.studentId,
      title: '🏠 Application Assigned',
      message: `Your hostel application has been approved and forwarded to the warden of ${hostel.name} for further allocation.`
    });

    // Create Notification for Warden
    await Notification.create({
      userId: hostel.wardenId._id,
      title: 'New Student Application Assigned',
      message: `${application.fullName}'s hostel application has been assigned to you for ${hostel.name}.`
    });

    res.json({ success: true, message: 'Application assigned successfully', application });
  } catch (error) {
    console.error('Error assigning hostel:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});


// Endpoint for Warden to fetch their approved applications by Email
router.get('/warden/by-email/approved', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({ success: false, message: 'Database disconnected' });
    }
    const email = req.query.email;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }
    const warden = await User.findOne({ email, role: 'WARDEN' });
    if (!warden) {
      return res.json([]); // return empty if warden not found in db
    }
    const applications = await HostelApplication.find({
      status: { $in: ['APPROVED', 'ASSIGNED TO WARDEN', 'BED_ALLOCATED', 'BED_ALLOCATION_PENDING'] },
      assignedWarden: warden._id
    }).sort({ assignedAt: -1 }).populate('assignedHostel').populate('assignedWarden');
    res.json(applications);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Endpoint for Warden to fetch their approved applications by ID
router.get('/warden/:wardenId/approved', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({ success: false, message: 'Database disconnected' });
    }
    const applications = await HostelApplication.find({
      status: { $in: ['APPROVED', 'ASSIGNED TO WARDEN', 'BED_ALLOCATED', 'BED_ALLOCATION_PENDING'] },
      assignedWarden: req.params.wardenId
    }).sort({ assignedAt: -1 }).populate('assignedHostel').populate('assignedWarden');
    res.json(applications);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
