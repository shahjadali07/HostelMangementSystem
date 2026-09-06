import express from 'express';
import multer from 'multer';
import path from 'path';
import mongoose from 'mongoose';
import User from '../models/User.js';
import HostelApplication from '../models/HostelApplication.js';

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

export default router;
