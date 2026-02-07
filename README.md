# 🚀 Employee Management System - Complete Setup Guide

A full-stack application with React frontend, Node.js backend, JWT authentication, and Google OAuth. Can be run with Docker or traditional Node.js setup.

---

## 🔧 **Two Ways to Run This Project**

### **Option 1: Docker Setup** (Recommended for Production)
- ✅ Isolated environment
- ✅ Same setup on any computer
- ✅ Includes database automatically
- ❌ Requires Docker installation

### **Option 2: Traditional Node.js Setup** (Quick Development)
- ✅ No Docker installation needed
- ✅ Faster for development
- ✅ Direct access to code
- ❌ Requires manual database setup

---

## 🐳 **DOCKER SETUP** (Option 1)

### **Prerequisites**
- Docker Desktop installed
- Docker Compose available

### **Quick Start**
```bash
# 1. Navigate to project
cd employee-management-system

# 2. Setup environment
cp .env.docker .env

# 3. Build and start everything
docker-compose build
docker-compose up -d

# 4. Access application
# Frontend: http://localhost:3000
# Backend: http://localhost:5000/api
```

---

## 💻 **NODE.JS SETUP** (Option 2 - No Docker Required)

### **Prerequisites**
- Node.js (v16 or higher)
- MongoDB running locally or MongoDB Atlas

### **Quick Start Commands**
```bash
# 1. Navigate to project
cd employee-management-system

# 2. Install backend dependencies
cd backend
npm install

# 3. Install frontend dependencies  
cd ../frontend
npm install

# 4. Start backend (Terminal 1)
cd ../backend
npm run dev

# 5. Start frontend (Terminal 2)
cd ../frontend
npm start

# 6. Access application
# Frontend: http://localhost:3000
# Backend: http://localhost:5000/api
```

### **Environment Setup for Node.js**
Your `.env` files are already configured! The system will work with existing setup.

---

## 1️⃣ **Folder Structure**

```
employee-management-system/
├── 📁 backend/                    # Node.js + Express API server
│   ├── 📁 config/                 # Database & OAuth configurations
│   ├── 📁 middleware/             # Authentication & security middleware
│   ├── 📁 models/                 # MongoDB data models (User, Employee, etc.)
│   ├── 📁 routes/                 # API endpoints (/auth, /employees, etc.)
│   ├── 📁 utils/                  # Helper functions (JWT, validation)
│   ├── 📄 Dockerfile              # Backend container instructions
│   ├── 📄 .dockerignore           # Files to exclude from Docker build
│   ├── 📄 .env                    # Backend environment variables
│   ├── 📄 package.json            # Backend dependencies
│   └── 📄 server.js               # Main backend entry point
│
├── 📁 frontend/                   # React + Vite frontend app
│   ├── 📁 src/                    # React source code
│   │   ├── 📁 components/         # Reusable UI components
│   │   ├── 📁 contexts/           # React Context (AuthContext)
│   │   ├── 📁 hooks/              # Custom React hooks
│   │   ├── 📁 pages/              # Page components (Login, Dashboard)
│   │   ├── 📁 services/           # API calls to backend
│   │   └── 📄 App.jsx             # Main React component
│   ├── 📄 Dockerfile              # Frontend container instructions
│   ├── 📄 nginx.conf              # Nginx web server configuration
│   ├── 📄 .dockerignore           # Files to exclude from Docker build
│   ├── 📄 .env                    # Frontend environment variables
│   ├── 📄 package.json            # Frontend dependencies
│   └── 📄 vite.config.js          # Vite build configuration
│
├── 📄 docker-compose.yml          # 🔥 Main Docker orchestration file
├── 📄 docker-compose.dev.yml      # Development version with hot reload
├── 📄 .env.docker                 # Docker environment template
├── 📄 mongo-init.js               # MongoDB initialization script
├── 📄 docker-scripts.sh           # Helper scripts (Linux/Mac)
├── 📄 docker-scripts.bat          # Helper scripts (Windows)
└── 📄 README.md                   # This documentation file
```

### **What Each Folder Does:**

- **`backend/`** - Contains the API server that handles authentication, database operations, and business logic
- **`frontend/`** - Contains the React web application that users interact with
- **`docker-compose.yml`** - Defines how all containers work together (frontend + backend + database)
- **`.env` files** - Store sensitive configuration like API keys and database passwords

---

## 2️⃣ **Commands to Run the Project**

### **Prerequisites Check**
```bash
# Check if Docker is installed
docker --version
docker-compose --version
```

### **Basic Commands (Works on Windows, Mac, Linux)**

#### **Navigate to Project**
```bash
cd employee-management-system
```

#### **First Time Setup**
```bash
# Copy environment template
cp .env.docker .env

# Build all Docker images
docker-compose build

# Start all services (frontend + backend + database)
docker-compose up -d
```

#### **Daily Development Commands**
```bash
# Start containers (if already built)
docker-compose up -d

# View logs from all services
docker-compose logs -f

# Stop all containers
docker-compose down

# Restart specific service
docker-compose restart backend
docker-compose restart frontend
```

#### **After Code Changes**
```bash
# Rebuild and restart (when you change code)
docker-compose down
docker-compose build
docker-compose up -d

# Quick rebuild specific service
docker-compose build backend
docker-compose up -d backend
```

#### **Development Mode (Hot Reload)**
```bash
# Use development version with live code updates
docker-compose -f docker-compose.dev.yml up -d
```

#### **Cleanup Commands**
```bash
# Stop and remove everything
docker-compose down -v

# Remove unused Docker resources
docker system prune -f
```

### **Platform-Specific Helper Scripts**

#### **Windows Users**
```cmd
# Use the batch script for easier management
docker-scripts.bat build    # Build images
docker-scripts.bat up       # Start services
docker-scripts.bat down     # Stop services
docker-scripts.bat logs     # View logs
```

#### **Linux/Mac Users**
```bash
# Make script executable first
chmod +x docker-scripts.sh

# Use the shell script
./docker-scripts.sh build   # Build images
./docker-scripts.sh up      # Start services
./docker-scripts.sh down    # Stop services
./docker-scripts.sh logs    # View logs
```

---

## 3️⃣ **Application Access**

### **URLs After Starting Docker**

| Service | URL | Purpose |
|---------|-----|---------|
| **Frontend** | http://localhost:3000 | Main web application (Login, Dashboard) |
| **Backend API** | http://localhost:5000/api | REST API endpoints |
| **API Health Check** | http://localhost:5000/api/health | Check if backend is running |
| **MongoDB** | localhost:27017 | Database (internal access only) |

### **How Frontend Talks to Backend**

```
User Browser → Frontend (Port 3000) → Backend API (Port 5000) → MongoDB (Port 27017)
```

**Inside Docker Network:**
- Frontend container calls backend using: `http://backend:5000`
- Backend container calls database using: `mongodb://mongodb:27017`
- **Port mapping** makes services accessible from your computer

---

## 4️⃣ **Logout Flow Explanation**

### **What Happens When User Clicks Logout**

1. **Frontend Action**
   - User clicks "Logout" button
   - React calls logout function in AuthContext

2. **Token Removal**
   - Access token removed from `localStorage`
   - Refresh token removed from HTTP-only cookie
   - API call sent to backend: `POST /api/auth/logout`

3. **Backend Processing**
   - Backend invalidates refresh token in database
   - Clears HTTP-only cookie
   - Returns success response

4. **Frontend Response**
   - AuthContext updates state (user = null, isAuthenticated = false)
   - Success message shown: "Successfully logged out"
   - User redirected to login page
   - Protected routes become inaccessible

5. **Security Result**
   - User cannot access protected pages
   - API calls fail without valid token
   - Complete session cleanup achieved

---

## 5️⃣ **Important Key Points**

### **Why Docker Compose is Used**
- **Orchestration**: Manages multiple containers (frontend + backend + database) as one application
- **Networking**: Creates isolated network so containers can talk to each other
- **Environment**: Ensures same setup on any computer (Windows, Mac, Linux)
- **Dependencies**: Automatically starts database before backend, backend before frontend

### **Common Beginner Mistakes**

❌ **Don't Do This:**
- Running `docker run` commands individually
- Forgetting to rebuild after code changes
- Using `localhost` in container-to-container communication
- Committing `.env` files with real passwords to Git

✅ **Do This Instead:**
- Always use `docker-compose` commands
- Rebuild containers after significant code changes
- Use service names in Docker network communication
- Use `.env.example` templates and keep real `.env` files private

### **Port Mapping Explanation**

```
Your Computer    →    Docker Container
localhost:3000   →    frontend:3000
localhost:5000   →    backend:5000
localhost:27017  →    mongodb:27017
```

- **External Port** (left): What you type in browser
- **Internal Port** (right): What container uses inside Docker network
- **Port conflicts**: If port 3000 is busy, change external port to 3001:3000

### **Environment Variables Usage**

```bash
# Backend .env
MONGODB_URI=mongodb://mongodb:27017/employee_management  # Uses Docker service name
JWT_SECRET=your-secret-key
GOOGLE_CLIENT_ID=your-google-client-id

# Frontend .env  
VITE_API_BASE_URL=http://localhost:5000  # External URL for browser
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

### **When to Rebuild vs Restart**

**Restart Only** (`docker-compose restart`):
- Changed environment variables
- Database data updates
- Minor configuration tweaks

**Rebuild Required** (`docker-compose build`):
- Added new npm packages
- Changed Dockerfile
- Modified build process
- Added new source code files

### **How to Debug if App Doesn't Start**

1. **Check Container Status**
   ```bash
   docker-compose ps
   ```

2. **View Logs**
   ```bash
   docker-compose logs backend
   docker-compose logs frontend
   docker-compose logs mongodb
   ```

3. **Common Issues & Solutions**
   - **Port already in use**: Change port in docker-compose.yml
   - **Build fails**: Check Dockerfile syntax and file paths
   - **Database connection fails**: Ensure MongoDB container is running
   - **Environment variables**: Verify .env file exists and has correct values

4. **Nuclear Option** (when everything fails)
   ```bash
   docker-compose down -v
   docker system prune -f
   docker-compose build --no-cache
   docker-compose up -d
   ```

---

## 6️⃣ **Final Checklist**

### **Before Running Project**

#### **✅ Docker Installation Check**
```bash
# These commands should work without errors
docker --version          # Should show Docker version
docker-compose --version  # Should show Docker Compose version
```

#### **✅ Port Availability Check**
- **Port 3000**: Frontend (should be free)
- **Port 5000**: Backend API (should be free)
- **Port 27017**: MongoDB (should be free)

**Check ports on Windows:**
```cmd
netstat -an | findstr :3000
netstat -an | findstr :5000
netstat -an | findstr :27017
```

**Check ports on Linux/Mac:**
```bash
lsof -i :3000
lsof -i :5000
lsof -i :27017
```

#### **✅ Environment Setup**
- [ ] `.env` file exists in project root
- [ ] `.env` file exists in `backend/` folder
- [ ] `.env` file exists in `frontend/` folder
- [ ] Google OAuth credentials added (optional for basic testing)

#### **✅ File Structure**
- [ ] `docker-compose.yml` exists in project root
- [ ] `backend/Dockerfile` exists
- [ ] `frontend/Dockerfile` exists
- [ ] `package.json` files exist in both backend and frontend folders

---

## 🚀 **Quick Start (Copy & Paste)**

```bash
# 1. Navigate to project
cd employee-management-system

# 2. Setup environment
cp .env.docker .env

# 3. Build and start everything
docker-compose build
docker-compose up -d

# 4. Check if running
docker-compose ps

# 5. View logs
docker-compose logs -f

# 6. Open in browser
# Frontend: http://localhost:3000
# Backend: http://localhost:5000/api/health
```

---

## 🔐 **Default Login Credentials**

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@example.com | Admin@123 |
| HR | hr@example.com | Hr@123 |
| Viewer | viewer@example.com | Viewer@123 |

---

## 🆘 **Need Help?**

### **Common Commands Reference**
```bash
# View running containers
docker-compose ps

# Follow logs in real-time
docker-compose logs -f

# Restart specific service
docker-compose restart backend

# Rebuild after code changes
docker-compose build && docker-compose up -d

# Complete cleanup
docker-compose down -v && docker system prune -f
```

### **Troubleshooting**
1. **App not loading**: Check `docker-compose ps` - all services should be "Up"
2. **Port conflicts**: Change external ports in `docker-compose.yml`
3. **Build errors**: Check `docker-compose logs` for specific error messages
4. **Database issues**: Ensure MongoDB container is running and healthy

---

## 🎉 **Success Indicators**

When everything works correctly:
- ✅ `docker-compose ps` shows all services as "Up"
- ✅ http://localhost:3000 loads the login page
- ✅ http://localhost:5000/api/health returns {"status":"OK"}
- ✅ You can login with default credentials
- ✅ Google OAuth button appears (even if not configured)

**Your Employee Management System is now running in Docker! 🚀**