import express from 'express';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import OTP from '../models/OTP.js';
import HostelApplication from '../models/HostelApplication.js';

const router = express.Router();

router.post('/send-otp', async (req, res) => {
  try {
    const { fullName, email, identifier, phone } = req.body;
    
    if (!email || !fullName || !identifier || !phone) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.passwordHash) {
      return res.status(409).json({ message: 'An account already exists with this email. Please login instead.' });
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await OTP.deleteMany({ email });

    await OTP.create({
      email,
      otpHash,
      expiresAt
    });

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      }
    });

    const mailOptions = {
      from: process.env.SMTP_FROM,
      to: email,
      subject: 'MMMUT Hostel Management System - Email Verification Code',
      text: `MMMUT Hostel Management System\n\nEmail Verification\n\nYour verification code is:\n\n${otp}\n\nThis code will expire in 10 minutes.\n\nPlease do not share this code with anyone.\n\nIf you did not request this verification code, you can safely ignore this email.`
    };

    await transporter.sendMail(mailOptions);

    res.json({ success: true, message: 'Verification code sent successfully' });
  } catch (error) {
    console.error('OTP Send Error:', error);
    res.status(500).json({ message: 'Unable to send verification email. Please try again later.' });
  }
});

router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP are required' });
    }

    const otpRecord = await OTP.findOne({ email });
    if (!otpRecord) {
      return res.status(400).json({ success: false, code: 'OTP_EXPIRED', message: 'This verification code has expired. Please request a new code.' });
    }
    
    if (otpRecord.verified) {
      return res.status(400).json({ success: false, code: 'ALREADY_VERIFIED', message: 'Email already verified.' });
    }

    if (otpRecord.attempts >= 5) {
      await OTP.deleteOne({ email });
      return res.status(400).json({ success: false, code: 'TOO_MANY_ATTEMPTS', message: 'Too many verification attempts. Please request a new verification code.' });
    }

    const isMatch = await bcrypt.compare(otp, otpRecord.otpHash);
    if (!isMatch) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      
      if (otpRecord.attempts >= 5) {
        await OTP.deleteOne({ email });
        return res.status(400).json({ success: false, code: 'TOO_MANY_ATTEMPTS', message: 'Too many verification attempts. Please request a new verification code.' });
      }
      return res.status(400).json({ success: false, code: 'INVALID_OTP', message: 'Invalid verification code.' });
    }

    otpRecord.verified = true;
    otpRecord.otpHash = undefined;
    await otpRecord.save();
    
    res.json({ success: true, message: 'Email verified successfully' });
  } catch (error) {
    console.error('OTP Verify Error:', error);
    res.status(500).json({ success: false, message: 'Unable to verify the code right now. Please try again.' });
  }
});

router.post('/create-account', async (req, res) => {
  try {
    const { email, password, fullName, phone, identifier } = req.body;

    if (!email || !password || !fullName || !phone || !identifier) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    // Backend password validation
    if (password.length < 8 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
      return res.status(400).json({ success: false, message: 'Password does not meet requirements' });
    }

    // Verify OTP state
    const otpRecord = await OTP.findOne({ email, verified: true });
    if (!otpRecord) {
      return res.status(400).json({ success: false, message: 'Email verification missing or expired. Please verify your email again.' });
    }

    // Check duplicate
    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.passwordHash) {
      return res.status(409).json({ success: false, message: 'An account already exists with this email. Please login instead.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    let user = existingUser;
    if (!user) {
      user = new User({
        fullName,
        email,
        phone,
        passwordHash,
        role: 'STUDENT',
        accountStatus: 'Active',
        emailVerified: true,
        emailVerifiedAt: new Date()
      });
    } else {
      user.passwordHash = passwordHash;
      user.accountStatus = 'Active';
      user.emailVerified = true;
      user.emailVerifiedAt = new Date();
    }
    await user.save();

    // Application linking removed as per instructions


    // Invalidate the OTP record so it can't be reused for another account creation
    await OTP.deleteOne({ email });

    res.json({ success: true, message: 'Account created successfully' });
  } catch (error) {
    console.error('Create Account Error:', error);
    res.status(500).json({ success: false, message: 'Unable to create account right now. Please try again.' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    // Use bcrypt for comparing password hash
    const user = await User.findOne({ email });
    
    if (!user || !user.passwordHash) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check Warden status
    if (user.role === 'WARDEN' && user.status !== 'ACTIVE') {
      return res.status(403).json({ message: 'Your account has been deactivated. Please contact the administrator.' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email, name: user.name, assignedHostel: user.assignedHostel, hostelId: user.hostelId },
      process.env.JWT_SECRET || 'secret_key_123',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        assignedHostel: user.assignedHostel,
        hostelId: user.hostelId
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
