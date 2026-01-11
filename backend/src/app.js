// backend/src/app.js
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');           // Optional: nice logging during development
const path = require('path');

// Import middleware
const { protect } = require('./middleware/authMiddleware');

// Import routes
const authRoutes = require('./routes/authRoutes');
const softSkillsRoutes = require('./routes/softSkillsRoutes');
// Add more routes here as you create them
// const codingRoutes = require('./routes/codingRoutes');
// const reportsRoutes = require('./routes/reportsRoutes');
// const courseRoutes = require('./routes/courseRoutes');
// etc...

// Import DB connection (we'll call it later in server.js)
const connectDB = require('./config/db');

const app = express();

// ── Middleware ───────────────────────────────────────────────────────────────

// Enable CORS - very important for frontend (React/Vite) communication
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'], // add your frontend url(s)
  credentials: true,
}));

// Logger (good for development)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Parse JSON & URL-encoded bodies
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Routes ───────────────────────────────────────────────────────────────────

// Public routes (no auth required)
app.use('/api/auth', authRoutes);

// Protected routes (require JWT)
app.use('/api/softskills', protect, softSkillsRoutes);
// app.use('/api/coding', protect, codingRoutes);
// app.use('/api/reports', protect, reportsRoutes);
// app.use('/api/courses', protect, courseRoutes);
// ... add other protected route groups here

// Basic health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'LMS Backend is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// ── 404 Not Found Handler ────────────────────────────────────────────────────
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Cannot find ${req.originalUrl}`,
  });
});

// ── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Global error:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

module.exports = app;