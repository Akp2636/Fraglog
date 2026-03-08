# 🎮 Fraglog

> **Letterboxd for Steam gamers.** Track your library, log playthroughs, write reviews, and discover what the community thinks — all powered by your real Steam data.

![Fraglog Banner](https://via.placeholder.com/1200x400/08080e/22c55e?text=FRAGLOG)

---

## ✨ Features

- 🔐 **Steam OpenID Login** — Sign in with your real Steam account, no extra registration
- 📚 **Library Sync** — Pulls your entire Steam library automatically
- 📝 **Game Logs** — Mark games as *Playing*, *Played*, *Want to Play*, or *Dropped*
- ⭐ **Reviews** — Write reviews with 0–5 star ratings, spoiler tags, and likes
- 👤 **Profiles** — Public user profiles showing stats, logs, and reviews
- 🔍 **Discover** — Browse any Steam game by App ID, see community reviews
- 📊 **Stats** — Total playtime, review count, genre breakdown

---

## 🛠 Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React 18, Vite, Tailwind CSS        |
| Backend    | Node.js, Express                    |
| Database   | MongoDB (Mongoose)                  |
| Auth       | Passport.js + Steam OpenID 2.0      |
| API        | Steam Web API + Steam Store API     |

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (free tier works fine)
- Steam API Key → https://steamcommunity.com/dev/apikey

### 1. Clone the repo
```bash
git clone https://github.com/yourusername/fraglog.git
cd fraglog
```

### 2. Set up environment variables
```bash
cp .env.example backend/.env
# Now edit backend/.env and fill in:
# - MONGO_URI
# - SESSION_SECRET
# - STEAM_API_KEY
```

### 3. Install all dependencies
```bash
npm run install:all
```

### 4. Run in development
```bash
npm run dev
```

- Frontend → http://localhost:5173
- Backend API → http://localhost:5000

---

## 📁 Project Structure

```
fraglog/
├── backend/
│   ├── config/         # DB connection, Passport config
│   ├── middleware/     # Auth middleware
│   ├── models/         # Mongoose schemas (User, Review, GameLog)
│   ├── routes/         # Express route handlers
│   └── server.js       # Entry point
├── frontend/
│   └── src/
│       ├── components/ # Reusable UI components
│       ├── context/    # Auth context (React Context API)
│       ├── hooks/      # Custom hooks
│       ├── pages/      # Route-level page components
│       └── utils/      # API helpers, formatters
└── .env.example
```

---

## 🔑 Steam API Setup

1. Go to https://steamcommunity.com/dev/apikey
2. Enter your domain (use `localhost` for dev)
3. Copy the key into `backend/.env` as `STEAM_API_KEY`

> **Note:** Steam OpenID requires your Steam profile to be **public** for the library sync to work.

---

## 📦 Available Scripts

| Command             | Description                          |
|---------------------|--------------------------------------|
| `npm run dev`       | Run frontend + backend concurrently  |
| `npm run server`    | Run backend only                     |
| `npm run client`    | Run frontend only                    |
| `npm run build`     | Build frontend for production        |
| `npm run install:all` | Install all dependencies           |

---

## 🎓 College Project Notes

This is a college-level project demonstrating:
- RESTful API design with Express
- NoSQL data modeling with MongoDB/Mongoose
- Third-party OAuth authentication (Steam OpenID)
- External API integration (Steam Web API)
- React component architecture with Context API
- Responsive UI design with Tailwind CSS

---

*Built with ❤️ and too many hours of gaming*
