import express from 'express';
import Hostel from '../models/Hostel.js';

const router = express.Router();

// Get all hostels with populated wardens
router.get('/', async (req, res) => {
  try {
    const hostels = await Hostel.find().populate('wardenId', 'fullName email phone');
    res.json(hostels);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
