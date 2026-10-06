import express from 'express';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

const router = express.Router();

// Get hostel and its wardens by hostel ID
router.get('/hostels/:hostelId/wardens', async (req, res) => {
  try {
    const Hostel = (await import('../models/Hostel.js')).default;
    const hostel = await Hostel.findById(req.params.hostelId);
    if (!hostel) {
      return res.status(404).json({ success: false, message: 'Hostel not found' });
    }
    
    // Fetch wardens associated with this hostel
    // Using string hostelId or ObjectId, since currently the db might use strings based on frontend seed
    const wardens = await User.find({ 
      role: 'WARDEN', 
      $or: [
        { hostelId: req.params.hostelId },
        { hostelId: hostel.name }, // fallback if stored by name
        { hostelId: req.params.hostelId.toString() }
      ]
    });

    const formattedWardens = wardens.map(w => ({
      id: w._id.toString(),
      fullName: w.fullName,
      email: w.email,
      phone: w.phone,
      employeeId: w.employeeId,
      designation: w.designation,
      hostelId: w.hostelId,
      position: w.position,
      status: w.status,
      createdAt: w.createdAt,
      hostel: { name: hostel.name, id: hostel._id.toString() }
    }));

    res.json({
      success: true,
      hostel: {
        _id: hostel._id.toString(),
        name: hostel.name,
        type: hostel.category,
        capacity: hostel.capacity,
        occupied: hostel.occupied,
        students: hostel.occupied // some frontends expect students
      },
      wardens: formattedWardens
    });
  } catch (error) {
    console.error('Error fetching hostel wardens:', error);
    res.status(500).json({ success: false, message: 'Server error fetching hostel wardens' });
  }
});


// Get all wardens
router.get('/wardens', async (req, res) => {
  try {
    // Only get Users who are wardens and not fully deleted (can include DELETED if frontend expects it, frontend handles DELETED)
    const wardens = await User.find({ role: 'WARDEN' });
    
    // Map to frontend expected format
    const formattedWardens = wardens.map(w => ({
      id: w._id.toString(),
      fullName: w.fullName,
      email: w.email,
      phone: w.phone,
      employeeId: w.employeeId,
      designation: w.designation,
      hostelId: w.hostelId,
      position: w.position,
      status: w.status,
      username: w.email,
      role: w.role,
      createdAt: w.createdAt
    }));
    
    res.json(formattedWardens);
  } catch (error) {
    console.error('Error fetching wardens:', error);
    res.status(500).json({ message: 'Server error fetching wardens' });
  }
});

// Get single warden by ID
router.get('/wardens/:id', async (req, res) => {
  try {
    const warden = await User.findById(req.params.id);
    if (!warden || warden.role !== 'WARDEN') {
      return res.status(404).json({ success: false, message: 'Warden not found' });
    }
    
    // We should also fetch the hostel data if possible.
    let hostelData = null;
    if (warden.hostelId) {
      // In this DB, hostelId in User model might be a string (e.g. 'raman') or an ObjectId.
      // Let's assume it's a string identifier like 'raman' based on frontend data, or it could be an ObjectId.
      // Wait, let's just use the frontend HOSTELS approach or try finding it in Hostel collection.
      const Hostel = (await import('../models/Hostel.js')).default;
      
      let hostel;
      // check if warden.hostelId is a valid object id
      if (mongoose.Types.ObjectId.isValid(warden.hostelId)) {
         hostel = await Hostel.findById(warden.hostelId);
      } else {
         hostel = await Hostel.findOne({ name: { $regex: new RegExp(warden.hostelId, 'i') } });
      }

      if (hostel) {
        hostelData = {
          _id: hostel._id,
          name: hostel.name,
          type: hostel.category,
          capacity: hostel.capacity,
          occupied: hostel.occupied
        };
      } else {
         // fallback if it's a string like 'raman' but not in db
         hostelData = {
            _id: warden.hostelId,
            name: warden.hostelId,
            type: "Unknown",
            capacity: 0
         };
      }
    }

    res.json({
      success: true,
      warden: {
        _id: warden._id.toString(),
        name: warden.fullName,
        email: warden.email,
        phone: warden.phone,
        status: warden.status,
        employeeId: warden.employeeId,
        designation: warden.designation,
        position: warden.position,
        createdAt: warden.createdAt,
        updatedAt: warden.updatedAt,
        hostel: hostelData
      }
    });

  } catch (error) {
    console.error('Error fetching warden by id:', error);
    res.status(500).json({ message: 'Server error fetching warden' });
  }
});

// Create new warden
router.post('/wardens', async (req, res) => {
  try {
    const { fullName, email, phone, employeeId, designation, hostelId, position, status, passwordHash } = req.body;

    // Validate if warden exists (email or employeeId)
    const existingWarden = await User.findOne({ $or: [{ email }, { employeeId }] });
    if (existingWarden) {
      if (existingWarden.email === email) {
        return res.status(400).json({ message: 'A warden with this email already exists.' });
      }
      if (existingWarden.employeeId === employeeId) {
        return res.status(400).json({ message: 'Employee ID already in use.' });
      }
    }

    // Check position limit in hostel (max 2) - usually checked on frontend, but good to have backend check too
    const activeWardens = await User.find({ hostelId: hostelId, role: 'WARDEN', status: 'ACTIVE' });
    if (activeWardens.length >= 2) {
      return res.status(400).json({ message: 'Maximum 2 active wardens can be assigned to this hostel.' });
    }
    const positionTaken = activeWardens.some(w => w.position === position);
    if (positionTaken) {
      return res.status(400).json({ message: `${position === 'WARDEN_1' ? 'Warden 1' : 'Warden 2'} position is already taken in this hostel.` });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPw = await bcrypt.hash(passwordHash, salt);

    let assignedHostelId = null;
    if (mongoose.Types.ObjectId.isValid(hostelId)) {
        assignedHostelId = hostelId;
    } else {
        const Hostel = (await import('../models/Hostel.js')).default;
        const hostelDoc = await Hostel.findOne({ name: { $regex: new RegExp(hostelId, 'i') } });
        if (hostelDoc) assignedHostelId = hostelDoc._id;
    }

    const newWarden = new User({
      fullName,
      email,
      phone,
      employeeId,
      designation,
      hostelId: hostelId,
      assignedHostel: assignedHostelId,
      position,
      status: status || 'ACTIVE',
      passwordHash: hashedPw,
      role: 'WARDEN'
    });

    await newWarden.save();

    res.status(201).json({
      success: true,
      warden: {
        id: newWarden._id.toString(),
        fullName: newWarden.fullName,
        email: newWarden.email,
        phone: newWarden.phone,
        employeeId: newWarden.employeeId,
        designation: newWarden.designation,
        hostelId: newWarden.assignedHostel,
        position: newWarden.position,
        status: newWarden.status,
        username: newWarden.email,
        role: newWarden.role,
        createdAt: newWarden.createdAt
      }
    });

  } catch (error) {
    console.error('Error creating warden:', error);
    res.status(500).json({ message: 'Server error creating warden' });
  }
});

// Update warden
router.put('/wardens/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    
    if (updateData.hostelId) {
      if (mongoose.Types.ObjectId.isValid(updateData.hostelId)) {
          updateData.assignedHostel = updateData.hostelId;
      } else {
          const Hostel = (await import('../models/Hostel.js')).default;
          const hostelDoc = await Hostel.findOne({ name: { $regex: new RegExp(updateData.hostelId, 'i') } });
          if (hostelDoc) updateData.assignedHostel = hostelDoc._id;
      }
    }
    
    const updated = await User.findByIdAndUpdate(id, updateData, { new: true });
    
    if (!updated) {
      return res.status(404).json({ message: 'Warden not found' });
    }

    res.json({ success: true, warden: updated });
  } catch (error) {
    console.error('Error updating warden:', error);
    res.status(500).json({ message: 'Server error updating warden' });
  }
});

// Delete warden (Soft delete)
router.delete('/wardens/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await User.findByIdAndUpdate(id, { status: 'DELETED' }, { new: true });
    
    if (!updated) {
      return res.status(404).json({ message: 'Warden not found' });
    }

    res.json({ success: true, message: 'Warden deleted successfully' });
  } catch (error) {
    console.error('Error deleting warden:', error);
    res.status(500).json({ message: 'Server error deleting warden' });
  }
});

// Reset Password
router.put('/wardens/:id/password', async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;
    
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPw = await bcrypt.hash(newPassword, salt);

    const updated = await User.findByIdAndUpdate(id, { passwordHash: hashedPw }, { new: true });
    
    if (!updated) {
      return res.status(404).json({ message: 'Warden not found' });
    }

    res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ message: 'Server error resetting password' });
  }
});

export default router;
