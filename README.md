# Fraglog 🎮

> Letterboxd for Steam gamers — track, rate and review your games.

## Stack
- **Frontend**: React 18 + Vite + Tailwind CSS → Vercel
- **Backend**: Node.js + Express + MongoDB → Render
- **Auth**: Manual Steam OpenID 2.0 (stateless, no passport-steam)

## Setup

### 1. Clone
```bash
git clone https://github.com/yourusername/fraglog
cd fraglog
npm run install:all
```

### 2. Backend .env
Create `backend/.env`:
```env
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/fraglog
SESSION_SECRET=any_long_random_string
STEAM_API_KEY=get_from_steamcommunity.com/dev/apikey
BACKEND_URL=https://fraglog.onrender.com
FRONTEND_URL=https://fraglog.vercel.app
NODE_ENV=production
```

### 3. Render (Backend)
- New Web Service → connect GitHub repo
- Root directory: `backend`
- Build: `npm install`
- Start: `node server.js`
- Add all env vars from step 2 in Render dashboard

### 4. Vercel (Frontend)
- New Project → connect GitHub repo
- Root directory: `frontend`
- Framework: Vite
- Add env var: `VITE_API_URL=https://fraglog.onrender.com`

### 5. Steam API Key
- Get key at: https://steamcommunity.com/dev/apikey
- Domain: your Render URL (e.g. `fraglog.onrender.com`)

### Local dev
```bash
# Uses localhost:5000 for backend, localhost:5173 for frontend
# Create backend/.env with localhost URLs for local dev
npm run dev
```
## 🐳 DevOps & Deployment
- Dockerized Backend
cd backend
docker build -t fraglog-backend .
docker run -p 5000:5000 --env-file .env fraglog-backend

## CI/CD Workflow (GitHub Actions)

- Builds production Docker image.
- Pushes image to AWS ECR.
- Deploys to EC2 instance automatically.

## ☁️ AWS Services Used
 - EC2 → runs backend container
 - ECR → stores Docker images
 - IAM → secure access for CI/CD

 ### EC2 run command

```docker run -d -p 5000:5000 \
-e MONGO_URI="your_mongo_uri" \
-e SESSION_SECRET="your_secret" \
-e JWT_SECRET="your_jwt" \
-e FRONTEND_URL="https://fraglog.vercel.app" \
<your-ecr-image-uri>
```
### 🧠 Highlights

- User clicks Sign In → /api/auth/steam
- Backend builds Steam OpenID URL and redirects to Steam
- Steam authenticates user and redirects to /api/auth/steam/callback
- Backend verifies OpenID assertion, fetches Steam profile, saves to MongoDB
- Backend encodes user and redirects to frontend with token
- Frontend stores token → user stays logged in


## Auth Flow
1. User clicks Sign In → redirect to `backend/api/auth/steam`
2. Backend builds Steam OpenID URL and redirects to Steam
3. Steam authenticates user and redirects to `backend/api/auth/steam/callback`
4. Backend verifies OpenID assertion (stateless), fetches Steam profile, saves to MongoDB
5. Backend encodes user as base64 token and redirects to `frontend/auth/callback?token=...`
6. Frontend AuthCallback decodes token, saves to localStorage, redirects to profile
7. On every page load, AuthContext reads localStorage → user stays logged in
