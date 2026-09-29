require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');

// ── Connect to MongoDB ────────────────────────────────────────────────────────
connectDB();

const app = express();

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Seed default memories after DB connects
const { seedDefaultMemories } = require('./services/memoryEngine');
setTimeout(() => {
  seedDefaultMemories();
}, 1000);

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/incidents', require('./routes/incidentRoutes'));
app.use('/api/memories', require('./routes/memoryRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));

// Health check
app.get('/health', (_req, res) => {
  const mongoSafe = (process.env.MONGO_URI || '').replace(/:([^@]+)@/, ':****@');
  res.json({
    status: 'ok',
    app: 'RecallOps MERN Server',
    timestamp: new Date().toISOString(),
    mongo: mongoSafe || 'Connected',
    modules: ['auth', 'incidents', 'memories', 'analytics', 'scenarios'],
  });
});

// Root
app.get('/', (_req, res) => {
  res.json({
    app: 'RecallOps MERN API',
    version: '1.0.0',
    endpoints: {
      register: 'POST /api/auth/register',
      login: 'POST /api/auth/login',
      logout: 'POST /api/auth/logout',
      me: 'GET /api/auth/me (protected)',
      health: 'GET /health',
    },
  });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global error handler
app.use((err, _req, res, _next) => {
  console.error('[GlobalError]', err);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

// ── Start Server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 RecallOps MERN server running on http://localhost:${PORT}`);
  console.log(`📦 MongoDB URI: ${process.env.MONGO_URI}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
});
