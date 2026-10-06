import express from 'express';
import HostelApplication from '../models/HostelApplication.js';
import Room from '../models/Room.js';
import Fee from '../models/Fee.js';
import Notification from '../models/Notification.js';
import multer from 'multer';
import path from 'path';

import { authMiddleware, requireApprovedApplication } from '../middleware/authMiddleware.js';

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

const cpUpload = upload.fields([
  { name: 'photo', maxCount: 1 },
  { name: 'signature', maxCount: 1 },
  { name: 'aadhaarDoc', maxCount: 1 },
  { name: 'documents', maxCount: 10 }
]);

// Apply auth middleware to all student routes
router.use(authMiddleware);

// Get student application status
router.get('/application/status', async (req, res) => {
  try {
    const studentId = req.user.id;
    const application = await HostelApplication.findOne({ studentId }).sort({ submittedAt: -1 });
    if (!application) {
      return res.json({ hasApplication: false });
    }
    return res.json({ 
      hasApplication: true, 
      status: application.status, 
      applicationNumber: application.id 
    });
  } catch (error) {
    console.error('Error fetching application status:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get student dashboard data
router.get('/dashboard', async (req, res) => {
  try {
    const studentId = req.user.id;

    // Fetch Application
    const application = await HostelApplication.findOne({ studentId }).sort({ submittedAt: -1 });
    
    // Fetch User
    const User = (await import('../models/User.js')).default;
    const user = await User.findById(studentId).select('-passwordHash');

    if (!application) {
      return res.status(403).json({
        success: false,
        code: 'HOSTEL_REGISTRATION_REQUIRED',
        message: 'Please complete hostel registration before accessing the student dashboard.',
        user
      });
    }
    
    // Fetch Room if allocated
    let room = null;
    let bed = null;
    const roomRecord = await Room.findOne({ 'beds.studentId': studentId });
    if (roomRecord) {
      room = {
        hostelName: roomRecord.hostelName,
        block: roomRecord.block,
        floor: roomRecord.floor,
        roomNumber: roomRecord.roomNumber
      };
      const bedRecord = roomRecord.beds.find(b => b.studentId && b.studentId.toString() === studentId);
      if (bedRecord) {
        bed = bedRecord.bedNumber;
      }
    }

    // Fetch Fee Record
    const fee = await Fee.findOne({ studentId }).sort({ createdAt: -1 });

    // Fetch Notifications
    const notifications = await Notification.find({ userId: studentId }).sort({ createdAt: -1 }).limit(10);

    res.json({
      success: true,
      user,
      application,
      roomAllocation: room ? { ...room, bed } : null,
      fee,
      notifications
    });

  } catch (error) {
    console.error('Error fetching student dashboard:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Submit hostel application
router.post('/application', cpUpload, async (req, res) => {
  try {
    const studentId = req.user.id;
    
    // 1. Identify the authenticated student
    const User = (await import('../models/User.js')).default;
    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student account not found.' });
    }

    // 2. Check that the student does not already have an active hostel application
    const existingApp = await HostelApplication.findOne({ studentId });
    if (existingApp) {
      return res.status(409).json({ 
        success: false, 
        code: 'APPLICATION_ALREADY_EXISTS',
        message: 'You already have a hostel application.' 
      });
    }

    const {
      fullName, gender, dob, phone, email, aadhaar, category,
      department, year, jeeApplicationNo, cuetApplicationNo, enrollmentNo,
      fatherName, motherName, parentPhone, parentEmail, permanentAddress, city, state, pincode
    } = req.body;

    // Check for duplicate application by enrollmentNo/aadhaar (optional business logic safeguard)
    const searchCriteria = [{ aadhaar }];
    if (enrollmentNo) {
      searchCriteria.push({ enrollmentNo });
    }
    const duplicateApp = await HostelApplication.findOne({ $or: searchCriteria });
    if (duplicateApp) {
      return res.status(409).json({ success: false, message: 'An application with this Aadhaar or Enrollment Number already exists.' });
    }

    // 3. Generate Application ID (e.g., HMS-2026-XXXX)
    const count = await HostelApplication.countDocuments();
    const newId = `HMS-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    // 4. Get uploaded file paths
    const photoUrl = req.files && req.files['photo'] ? req.files['photo'][0].path : null;
    const signatureUrl = req.files && req.files['signature'] ? req.files['signature'][0].path : null;
    const aadhaarDocUrl = req.files && req.files['aadhaarDoc'] ? req.files['aadhaarDoc'][0].path : null;
    const otherDocumentsUrls = req.files && req.files['documents'] ? req.files['documents'].map(f => f.path) : [];

    // 5. Create the hostel application
    const application = new HostelApplication({
      studentId: student._id,
      id: newId,
      status: 'NEW',
      fullName: student.fullName,
      email: student.email,
      phone: student.phone,
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

    res.json({
      success: true,
      message: 'Hostel application submitted successfully',
      applicationNumber: newId,
      status: 'NEW'
    });
  } catch (error) {
    console.error('Error submitting application:', error.message || error);
    if (error.name === 'ValidationError') {
      console.error('Validation errors:', error.errors);
    }
    res.status(500).json({ success: false, message: 'Server error while submitting application' });
  }
});

// Get student profile data
router.get('/profile', async (req, res) => {
  try {
    const studentId = req.user.id;

    // Fetch User
    const User = (await import('../models/User.js')).default;
    const user = await User.findById(studentId).select('-passwordHash -__v');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Fetch Application
    const application = await HostelApplication.findOne({ studentId }).sort({ submittedAt: -1 });

    if (!application) {
      return res.status(403).json({
        success: false,
        code: 'HOSTEL_REGISTRATION_REQUIRED',
        message: 'Please complete hostel registration before accessing your profile.',
        user
      });
    }

    // Fetch Room if allocated
    let allocation = null;
    if (application && application.assignedRoom) {
      const roomRecord = await Room.findById(application.assignedRoom);
      if (roomRecord) {
        allocation = {
          hostelName: roomRecord.hostelName,
          block: roomRecord.block,
          floor: roomRecord.floor,
          roomNumber: roomRecord.roomNumber,
          bed: application.assignedBed
        };
        // Fetch Warden for this hostel if needed, but we can leave it simple
      }
    } else {
      // Fallback: check room collection directly just in case application is out of sync
      const roomRecord = await Room.findOne({ 'beds.studentId': studentId });
      if (roomRecord) {
        const bedRecord = roomRecord.beds.find(b => b.studentId && b.studentId.toString() === studentId);
        allocation = {
          hostelName: roomRecord.hostelName,
          block: roomRecord.block,
          floor: roomRecord.floor,
          roomNumber: roomRecord.roomNumber,
          bed: bedRecord ? bedRecord.bedNumber : null
        };
      }
    }

    res.json({
      success: true,
      user,
      application,
      allocation
    });

  } catch (error) {
    console.error('Error fetching student profile:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Mark notification as read
router.put('/notifications/:id/read', async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (notification) {
      notification.isRead = true;
      await notification.save();
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Protected routes that require an APPROVED application
router.get('/hostel', requireApprovedApplication, (req, res) => res.json({ success: true }));
router.get('/room', requireApprovedApplication, (req, res) => res.json({ success: true }));
router.get('/bed', requireApprovedApplication, (req, res) => res.json({ success: true }));
router.post('/complaints', requireApprovedApplication, (req, res) => res.json({ success: true }));
router.post('/leave', requireApprovedApplication, (req, res) => res.json({ success: true }));
router.post('/visitors', requireApprovedApplication, (req, res) => res.json({ success: true }));
router.post('/maintenance', requireApprovedApplication, (req, res) => res.json({ success: true }));

export default router;
