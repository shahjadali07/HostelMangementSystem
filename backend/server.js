import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import dns from 'dns';

import applicationRoutes from './routes/applicationRoutes.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Must load env BEFORE anything else
dotenv.config();

// ─── Fix Node.js DNS resolver ────────────────────────────────────────────────
// Node.js c-ares resolver defaults to 127.0.0.1 on this system, but no local
// DNS server is running. The institutional DNS at 172.16.1.3 is functional
// (verified via nslookup). This is required for mongodb+srv:// SRV lookups.
dns.setServers(['172.16.1.3']);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/applications', applicationRoutes);

app.get('/', (req, res) => {
  res.send('API is running...');
});

// ─── Mongoose connection lifecycle events (safe — no credentials logged) ────
mongoose.connection.on('connected', () => {
  console.log('MongoDB connected successfully');
});
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err.message);
});
mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected. Attempting to reconnect...');
});

// ─── Connect DB first, THEN start Express ───────────────────────────────────
const startServer = async () => {
  if (!process.env.MONGODB_URI) {
    console.error('FATAL: MONGODB_URI is not set in .env file. Exiting.');
    process.exit(1);
  }

  try {
    console.log('MongoDB URI configured:', !!process.env.MONGODB_URI);
    console.log('DNS servers:', dns.getServers());
    console.log('MongoDB connecting...');
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,  // fail fast if Atlas is unreachable
      connectTimeoutMS: 10000,
    });
    // 'connected' event above fires here
    console.log('MongoDB readyState:', mongoose.connection.readyState);

    // Only start Express AFTER DB is ready
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    console.error('⚠️  Server NOT started. Fix the MongoDB connection first.');
    console.error('   Check: MongoDB Atlas → Security → Network Access → add your IP');
    process.exit(1);
  }
};

startServer();
