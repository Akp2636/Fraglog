# Fraglog 🎮

> Letterboxd for Steam gamers — track, rate and review your games.

---

## 🚀 Live Architecture

- **Frontend**: React 18 + Vite + Tailwind CSS → Vercel  
- **Backend**: Node.js + Express (Dockerized) → AWS EC2  
- **Database**: MongoDB Atlas  
- **Container Registry**: AWS ECR  
- **CI/CD**: GitHub Actions → Auto build & push Docker images to ECR  
- **Auth**: Steam OpenID 2.0 (stateless, custom implementation)

---

## 🧠 System Flow


User → Vercel Frontend
↓
EC2 Backend (Docker container)
↓
MongoDB Atlas
↓
GitHub Actions → AWS ECR → EC2


---

## 📦 Docker Setup (Backend)

### Build Image (local)
```bash
cd backend
docker build -t fraglog-backend .
Run Container (local)
docker run -p 5000:5000 \
-e MONGO_URI="your_mongo_uri" \
-e SESSION_SECRET="your_secret" \
-e JWT_SECRET="your_jwt" \
-e FRONTEND_URL="http://localhost:5173" \
fraglog-backend
⚙️ CI/CD Pipeline

On every push to main:

GitHub Actions builds Docker image
Pushes image to AWS ECR
Image becomes available for EC2 deployment
☁️ AWS Deployment
Services Used
EC2 → Hosts backend container
ECR → Stores Docker images
IAM → Secure access for CI/CD
EC2 Run Command
docker run -d -p 5000:5000 \
-e MONGO_URI="your_mongo_uri" \
-e SESSION_SECRET="your_secret" \
-e JWT_SECRET="your_jwt" \
-e FRONTEND_URL="https://fraglog.vercel.app" \
<your-ecr-image-uri>
🔐 Environment Variables (Backend)

Create backend/.env:

MONGO_URI=your_mongodb_uri
SESSION_SECRET=your_secret
JWT_SECRET=your_jwt
STEAM_API_KEY=your_steam_api_key
FRONTEND_URL=https://fraglog.vercel.app
NODE_ENV=production
🌐 Frontend Setup (Vercel)
Root directory: frontend
Framework: Vite
Env variable:
VITE_API_URL=http://<your-ec2-ip>:5000
🔑 Steam API Setup
Get key: https://steamcommunity.com/dev/apikey
Domain: your backend URL (EC2 IP or domain)
💻 Local Development
npm run install:all
npm run dev
Backend → http://localhost:5000
Frontend → http://localhost:5173
🔄 Auth Flow
User clicks Sign In → /api/auth/steam
Redirect to Steam OpenID
Steam → callback /api/auth/steam/callback
Backend verifies user & stores in MongoDB
Backend sends token → frontend
Frontend stores token → user stays logged in
🧠 Key Features
Steam library sync via Steam Web API
Stateless authentication (OpenID + JWT)
Social graph (follow system, activity feed)
Game reviews and logging
Fully containerized backend
CI/CD automated deployment pipeline
🏆 Highlights
Built full-stack production app
Dockerized backend for portability
Implemented CI/CD using GitHub Actions
Deployed backend on AWS EC2 using Docker
Integrated MongoDB Atlas for cloud database
📌 Future Improvements
Domain + HTTPS (Nginx / Route53)
Auto-deploy to EC2 (zero manual steps)
Rate limiting & caching optimization
Microservices split (optional scaling)
