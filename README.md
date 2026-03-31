🎮 Fraglog
Letterboxd for Steam Gamers
Fraglog allows Steam users to track their library, rate their favorite titles, and share reviews with a community of gamers. Built with a focus on a seamless, stateless OpenID authentication flow and a robust CI/CD pipeline.

🏗️ System Architecture
Frontend: React (Vite) hosted on Vercel for lightning-fast edge delivery.

Backend: Node.js/Express API containerized with Docker and deployed on AWS EC2.

Database: MongoDB Atlas for scalable, document-based storage of user reviews and profiles.

Pipeline: GitHub Actions automates the build/push process to AWS ECR on every commit to main.

🛠️ Tech Stack
Frontend: React 18, Vite, Tailwind CSS, Axios.

Backend: Node.js, Express, MongoDB (Mongoose).

Authentication: Manual Steam OpenID 2.0 (Stateless implementation).

Infrastructure: Docker, AWS EC2, AWS ECR, GitHub Actions (CI/CD).

🚀 Quick Start
1. Clone & Install
Bash
git clone https://github.com/yourusername/fraglog
cd fraglog
npm run install:all
2. Environment Configuration
Create a .env file in the backend/ directory:

Code snippet
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/fraglog
SESSION_SECRET=your_random_string
STEAM_API_KEY=your_steam_key
BACKEND_URL=http://<your-ec2-ip>:5000
FRONTEND_URL=https://fraglog.vercel.app
3. Local Development
Bash
# Runs frontend on :5173 and backend on :5000
npm run dev
🐳 DevOps & Deployment
Dockerization
The backend is fully containerized for environment parity.

Bash
cd backend
docker build -t fraglog-backend .
docker run -p 5000:5000 --env-file .env fraglog-backend
CI/CD Workflow
On every push to the main branch, the following automated steps occur:

Lint & Test: Validates code integrity.

Build: Creates a production Docker image.

Push: Uploads the image to AWS Elastic Container Registry (ECR).

Deploy: Updates the running container instance on AWS EC2.

🔐 Steam Auth Flow (Stateless)
Fraglog implements a custom OpenID 2.0 flow to avoid the overhead of heavy libraries:

Redirect: User is sent to Steam’s secure login portal.

Verify: On callback, the backend validates the assertion directly with Steam's servers.

Tokenization: User data is encoded into a base64/JWT token.

Handshake: Token is passed to the frontend via URL params and stored in localStorage for persistent sessions.
