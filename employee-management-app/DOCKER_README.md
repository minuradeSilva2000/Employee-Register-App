# 🐳 Docker Quick Start

**Get the Employee Management System running in 2 minutes!**

---

## ⚡ Super Quick Start

```bash
# 1. Navigate to project
cd employee-management-app

# 2. Start everything
docker-compose up -d

# 3. Open browser
# http://localhost
```

**Login**: `admin@example.com` / `Admin@123`

---

## 🚀 Using Makefile (Recommended)

### Start Application
```bash
make deploy
```

### View Logs
```bash
make logs-f
```

### Stop Application
```bash
make down
```

### Restart
```bash
make restart
```

### Clean Up
```bash
make clean
```

### See All Commands
```bash
make help
```

---

## 📦 Manual Docker Commands

### Build
```bash
docker-compose build
```

### Start
```bash
docker-compose up -d
```

### Stop
```bash
docker-compose down
```

### View Logs
```bash
docker-compose logs -f
```

### Check Status
```bash
docker-compose ps
```

---

## 🔍 Health Checks

### Backend
```bash
curl http://localhost:5000/health
```

**Expected**: `{"success":true,"message":"Server is running"}`

### Frontend
```bash
curl http://localhost/health
```

**Expected**: `healthy`

---

## 🌐 Access Points

- **Frontend**: http://localhost
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

---

## 🔐 Test Accounts

```
Admin:
Email: admin@example.com
Password: Admin@123

User:
Email: user@example.com
Password: User@123
```

---

## 🛠️ Troubleshooting

### Containers won't start
```bash
# Check logs
docker-compose logs

# Rebuild
docker-compose build --no-cache
docker-compose up -d
```

### Port already in use
```bash
# Stop existing containers
docker-compose down

# Or change ports in docker-compose.yml
```

### Cannot connect to backend
```bash
# Check backend logs
docker-compose logs backend

# Restart backend
docker-compose restart backend
```

---

## 📚 Full Documentation

See `DOCKER_GUIDE.md` for complete documentation including:
- Architecture details
- Production deployment
- Security best practices
- Monitoring and logging
- Advanced configuration

---

## ✅ Quick Checklist

- [ ] Docker installed
- [ ] Docker Compose installed
- [ ] Run `docker-compose up -d`
- [ ] Check `docker-compose ps` (both healthy)
- [ ] Open http://localhost
- [ ] Login with test account
- [ ] Test CRUD operations

---

## 🎉 That's It!

Your containerized Employee Management System is running!

**Need help?** Check `DOCKER_GUIDE.md` for detailed documentation.

---

**Last Updated**: February 10, 2026
