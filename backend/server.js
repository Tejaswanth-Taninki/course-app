const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/db');

// Import route modules
const adminRoutes = require('./routes/adminRoutes');
const studentRoutes = require('./routes/studentRoutes');
const courseRoutes = require('./routes/courseRoutes');
const registrationRoutes = require('./routes/registrationRoutes');

const app = express();

const PORT = process.env.PORT || 5000;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@university.edu';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

/* =========================
   MIDDLEWARE
========================= */
app.use(
  cors({
    origin: [
      FRONTEND_URL,
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:3000',
    ],
    credentials: true,
  })
);

app.use(express.json({ limit: '50kb' }));

/* =========================
   HEALTH CHECK
========================= */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'B.Tech Course Registration Backend API is running smoothly',
    timestamp: new Date().toISOString(),
  });
});

/* =========================
   API ROUTES
========================= */
// Admin routes: /api/auth/admin/login, /api/admin/dashboard, /api/admin/courses, etc.
app.use('/api/auth/admin', adminRoutes);
app.use('/api/admin', adminRoutes);

// Student auth & profile routes: /api/auth/register, /api/auth/login, /api/me
app.use('/api/auth', studentRoutes);
app.use('/api', studentRoutes);

// Course catalog routes: /api/courses
app.use('/api/courses', courseRoutes);

// Course registration routes: /api/me/courses, /api/me/courses/:courseId
app.use('/api', registrationRoutes);

/* =========================
   VERCEL HANDLER
========================= */
module.exports = async (req, res) => {
  try {
    await connectDB();
    return app(req, res);
  } catch (error) {
    console.error('Backend initialization error:', error);
    return res.status(500).json({
      message: 'Backend could not connect to MongoDB.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/* =========================
   LOCAL DEVELOPMENT
========================= */
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  connectDB()
    .then(() => {
      app.listen(PORT, () => {
        console.log('============================================');
        console.log('🎓 B.Tech Course Registration Backend API');
        console.log(`📡 http://localhost:${PORT}`);
        console.log(`🔑 Admin: ${ADMIN_EMAIL}`);
        console.log('============================================');
      });
    })
    .catch((error) => {
      console.error('Failed to start local server:', error);
      process.exit(1);
    });
}