# 🚀 Quick Setup Instructions

## MongoDB Installation (Windows)

### Option 1: Install MongoDB Community Server (Recommended)
1. Download from: https://www.mongodb.com/try/download/community
2. Select Windows version
3. Download and run the installer
4. Choose "Complete" installation
5. Install MongoDB Compass (optional GUI)

### Option 2: Use MongoDB Atlas (Cloud - Easiest)
1. Go to: https://www.mongodb.com/atlas
2. Create free account
3. Create free cluster
4. Get connection string
5. Update .env file with your connection string

### Option 3: Use Docker (If you can install Docker Desktop)
1. Install Docker Desktop from https://www.docker.com/products/docker-desktop/
2. Run: `docker run -d -p 27017:27017 --name mongodb mongo:7.0`

## Quick Start (After MongoDB Setup)

### 1. Setup Environment Variables
Create `.env` file in project root:
```
MONGODB_URI=mongodb://localhost:27017/employee_management
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
JWT_REFRESH_SECRET=your_refresh_secret_key_here_make_it_long_and_random
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
FRONTEND_URL=http://localhost:3000
PORT=5000
NODE_ENV=development
```

### 2. Install Dependencies
```bash
# Backend dependencies
cd backend
npm install

# Frontend dependencies  
cd ../frontend
npm install
```

### 3. Start the Application
```bash
# Terminal 1: Start Backend
cd backend
npm run dev

# Terminal 2: Start Frontend
cd frontend  
npm start
```

### 4. Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Alternative: Use In-Memory Database (For Testing)

If you can't install MongoDB, I can modify the backend to use an in-memory database for testing.

## Need Help?

If you're having trouble with MongoDB installation, let me know and I can:
1. Set up an in-memory database version
2. Help with Docker installation
3. Provide more detailed MongoDB setup steps
