require('dotenv').config();
const express      = require('express');
const session      = require('express-session');
const cors         = require('cors');
const helmet       = require('helmet');
const morgan       = require('morgan');
const MongoStore   = require('connect-mongo');
const rateLimit    = require('express-rate-limit');
const connectDB    = require('./config/db');

const authRoutes   = require('./routes/auth');
const userRoutes   = require('./routes/users');
const gameRoutes   = require('./routes/games');
const reviewRoutes = require('./routes/reviews');
const logRoutes    = require('./routes/logs');

const app  = express();
const PORT = process.env.PORT || 5000;

connectDB();

// ── Trust proxy (required for Render/Railway/Heroku HTTPS) ───────────────────
app.set('trust proxy', 1);

// ── Security headers ──────────────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));

// ── Rate limiting ─────────────────────────────────────────────────────────────
app.use('/api/', rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));

// ── Logging ───────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));

// ── CORS ──────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:3000',
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error('CORS blocked: ' + origin));
  },
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','PATCH','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
}));

// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Session ───────────────────────────────────────────────────────────────────
app.use(session({
  secret           : process.env.SESSION_SECRET || 'fraglog_secret_dev',
  resave           : true,
  saveUninitialized: true,
  store            : MongoStore.create({
    mongoUrl       : process.env.MONGO_URI,
    collectionName : 'sessions',
    ttl            : 7 * 24 * 60 * 60,
  }),
  cookie: {
    secure  : process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge  : 7 * 24 * 60 * 60 * 1000,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  },
}));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',    authRoutes);
app.use('/api/users',   userRoutes);
app.use('/api/games',   gameRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/logs',    logRoutes);

// ── Health ────────────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

// ── Error handler ─────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('❌', err.message);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
  });
});

app.listen(PORT, () => {
  console.log(`\n🎮 Fraglog API running on port ${PORT}`);
  console.log(`🌐 Backend:  ${process.env.BACKEND_URL}`);
  console.log(`🖥️  Frontend: ${process.env.FRONTEND_URL}\n`);
});
