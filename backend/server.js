require('dotenv').config();

const express = require('express');
const session = require('express-session');
const passport = require('passport');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const MongoStore = require('connect-mongo');
const rateLimit = require('express-rate-limit');

const connectDB = require('./config/db');
require('./config/passport');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const gameRoutes = require('./routes/games');
const reviewRoutes = require('./routes/reviews');
const logRoutes = require('./routes/logs');

const app = express();
const PORT = process.env.PORT || 5000;

const FRONTEND = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');

connectDB();


// ── Security ────────────────────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));


// Required for Render (trust reverse proxy)
app.set('trust proxy', 1);


// ── Rate Limiting ───────────────────────────────────────────────────────────
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: 'Too many requests' }
}));


// ── Logging ─────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}


// ── CORS ────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: FRONTEND,
  credentials: true
}));


// ── Body Parsing ────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));


// ── Session Configuration ───────────────────────────────────────────────────
app.use(session({
  name: "fraglog.sid",
  secret: process.env.SESSION_SECRET || "fraglog_secret",

  resave: false,
  saveUninitialized: false,

  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    collectionName: "sessions",
    ttl: 24 * 60 * 60
  }),

  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 1 day
    httpOnly: true,

    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
  }
}));


// ── Passport ────────────────────────────────────────────────────────────────
app.use(passport.initialize());
app.use(passport.session());


// ── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/logs', logRoutes);


// ── Health Check ────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: "ok",
    message: "🎮 Fraglog API running"
  });
});


// ── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});


// ── Global Error Handler ────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.message);
  res.status(500).json({ error: "Internal server error" });
});


// ── Start Server ────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🎮 Fraglog running on port ${PORT}`);
  console.log(`🌐 Backend: ${process.env.BACKEND_URL}`);
  console.log(`🖥️ Frontend: ${process.env.FRONTEND_URL}\n`);
});