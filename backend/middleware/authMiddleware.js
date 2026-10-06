import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Authentication required' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key_123');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};


export const wardenMiddleware = async (req, res, next) => {
  if (req.user?.role !== 'WARDEN') {
    return res.status(403).json({ message: 'Access denied: Warden role required' });
  }

  // Real-time status check to immediately block deactivated wardens
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.status !== 'ACTIVE') {
      return res.status(403).json({ message: 'Your account has been deactivated. Please contact the administrator.' });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Server error verifying account status' });
  }

  // Strict Hostel-Level Authorization
  const requestedHostelId = req.params?.hostelId || req.body?.hostelId || req.query?.hostelId;
  if (requestedHostelId) {
    const userHostelIdStr = req.user.assignedHostel?.toString();
    const userHostelNameStr = req.user.hostelId?.toString();
    const requestedStr = requestedHostelId.toString();

    if (requestedStr !== userHostelIdStr && requestedStr !== userHostelNameStr) {
      return res.status(403).json({
        message: "You are not authorized to access this hostel"
      });
    }
  }

  next();
};

export const requireApprovedApplication = async (req, res, next) => {
  try {
    if (!req.user || req.user.role !== 'STUDENT') {
      return res.status(401).json({ message: 'Authentication required as student' });
    }

    const user = await User.findById(req.user.id);
    if (!user || user.accountStatus !== 'Active') {
      return res.status(403).json({ message: 'Account is not active' });
    }

    const HostelApplication = (await import('../models/HostelApplication.js')).default;
    const application = await HostelApplication.findOne({ studentId: req.user.id }).sort({ submittedAt: -1 });

    const approvedStatuses = ['APPROVED', 'ASSIGNED TO WARDEN', 'FORWARDED_TO_WARDEN', 'BED_ALLOCATION_PENDING', 'BED_ALLOCATED'];
    
    if (!application || !approvedStatuses.includes(application.status)) {
      return res.status(403).json({
        success: false,
        code: 'APPLICATION_NOT_APPROVED',
        message: 'Your application must be approved before accessing this feature.'
      });
    }

    req.application = application;
    next();
  } catch (error) {
    console.error('requireApprovedApplication error:', error);
    res.status(500).json({ message: 'Server error checking application status' });
  }
};
