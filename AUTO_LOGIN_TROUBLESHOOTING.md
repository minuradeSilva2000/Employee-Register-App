# 🔧 AUTO-LOGIN TROUBLESHOOTING GUIDE

**Issue**: Auto-login failed with message "auto-login failed. Please login manually."

---

## 🔍 DIAGNOSTIC STEPS

### Step 1: Check Browser Console

1. Open browser DevTools (Press F12)
2. Go to **Console** tab
3. Look for these log messages:

**Expected logs if working**:
```
🤖 AUTO-LOGIN: Scheduling auto-login in 1000 ms
🤖 AUTO-LOGIN: Starting automatic login process...
🤖 AUTO-LOGIN: Credentials populated
🤖 AUTO-LOGIN: Attempting login with: admin@example.com
✅ AUTO-LOGIN: Login successful! admin@example.com
✅ AUTO-LOGIN: Token verified, navigating to dashboard...
```

**If you see error logs**:
```
❌ AUTO-LOGIN: Login failed: [error message]
❌ AUTO-LOGIN: Error occurred: [error details]
```

Copy the error message and check solutions below.

---

### Step 2: Check Network Tab

1. Open browser DevTools (Press F12)
2. Go to **Network** tab
3. Refresh the page
4. Look for POST request to `auth/login`

**Check**:
- Status Code: Should be `200 OK`
- Response: Should contain `success: true` and `accessToken`
- Request Payload: Should have `email` and `password`

**If Status is 401**:
- Credentials are invalid
- Check backend database for user

**If Status is 500**:
- Backend error
- Check backend console logs

**If Request fails (red)**:
- Backend not running
- CORS issue
- Network problem

---

### Step 3: Verify Backend is Running

Open terminal and run:
```bash
curl http://localhost:5000/api/health
```

**Expected response**:
```json
{"status":"OK","message":"Employee Management API is running",...}
```

**If connection refused**:
```bash
cd backend
npm start
```

---

### Step 4: Test Login API Manually

Run this PowerShell command:
```powershell
$body = @{ email = "admin@example.com"; password = "Admin@123" } | ConvertTo-Json
Invoke-WebRequest -Uri "http://localhost:5000/api/auth/login" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing
```

**Expected**: Status 200 with JSON response containing `accessToken`

**If fails**: Backend issue - check backend logs

---

### Step 5: Check localStorage

1. Open DevTools (F12)
2. Go to **Application** tab
3. Expand **Local Storage**
4. Click on `http://localhost:3000`

**Should see**:
- `accessToken`: JWT token string
- `refreshToken`: JWT refresh token string

**If missing**: Auto-login didn't complete successfully

---

## 🐛 COMMON ISSUES & SOLUTIONS

### Issue 1: Backend Not Running

**Symptoms**:
- Console error: "Network Error" or "ERR_CONNECTION_REFUSED"
- Network tab shows failed request (red)

**Solution**:
```bash
# Terminal 1 - Start Backend
cd backend
npm start

# Wait for: "🚀 Server running on port 5000"
```

---

### Issue 2: CORS Error

**Symptoms**:
- Console error: "CORS policy: No 'Access-Control-Allow-Origin' header"
- Network tab shows CORS error

**Solution**:
Check `backend/server.js` has correct CORS configuration:
```javascript
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));
```

Restart backend after changes.

---

### Issue 3: Invalid Credentials

**Symptoms**:
- Console log: "❌ AUTO-LOGIN: Login failed: Invalid credentials"
- Status 401 in Network tab

**Solution**:
Verify user exists in database:
```bash
mongosh
use employee_management
db.users.findOne({ email: "admin@example.com" })
```

If user doesn't exist, run database initialization:
```bash
cd backend
node config/database-simple.js
```

---

### Issue 4: MongoDB Not Running

**Symptoms**:
- Backend console error: "MongoServerError: connect ECONNREFUSED"
- Backend fails to start

**Solution**:
Start MongoDB:
```bash
# Windows
net start MongoDB

# Or start MongoDB service from Services app
```

---

### Issue 5: Frontend Not Recompiled

**Symptoms**:
- Auto-login code not executing
- No console logs at all

**Solution**:
Restart frontend:
```bash
# Stop frontend (Ctrl+C)
cd frontend
npm start
```

Wait for "Compiled successfully!" message.

---

### Issue 6: Browser Cache

**Symptoms**:
- Old code still running
- Changes not reflected

**Solution**:
Hard refresh browser:
- Windows: `Ctrl + Shift + R`
- Or: DevTools → Right-click refresh → "Empty Cache and Hard Reload"

---

### Issue 7: Port Already in Use

**Symptoms**:
- Frontend error: "Port 3000 is already in use"
- Backend error: "Port 5000 is already in use"

**Solution**:
Kill processes on ports:
```powershell
# Find process on port 3000
Get-NetTCPConnection -LocalPort 3000 | Select-Object OwningProcess

# Kill process (replace PID with actual process ID)
Stop-Process -Id PID -Force

# Same for port 5000
Get-NetTCPConnection -LocalPort 5000 | Select-Object OwningProcess
Stop-Process -Id PID -Force
```

---

## 🔧 MANUAL FIX STEPS

### Option 1: Disable Auto-Login Temporarily

Edit `frontend/src/pages/auth/Login.tsx`:
```typescript
// Line ~120
const AUTO_LOGIN_ENABLED = false; // ← Change to false
```

Save file, wait for recompile, then login manually to test if basic login works.

---

### Option 2: Increase Auto-Login Delay

Edit `frontend/src/pages/auth/Login.tsx`:
```typescript
// Line ~121
const AUTO_LOGIN_DELAY = 3000; // ← Change to 3 seconds
```

This gives more time for backend to be ready.

---

### Option 3: Check API Base URL

Edit `frontend/.env`:
```
REACT_APP_API_URL=http://localhost:5000/api
```

Make sure this matches your backend URL.

---

## 📊 DIAGNOSTIC CHECKLIST

Run through this checklist:

- [ ] Backend running on port 5000
- [ ] Frontend running on port 3000
- [ ] MongoDB running
- [ ] Backend health check returns 200 OK
- [ ] Login API test returns 200 OK with token
- [ ] Browser console shows auto-login logs
- [ ] Network tab shows successful POST to /auth/login
- [ ] No CORS errors in console
- [ ] No red errors in console
- [ ] Frontend compiled successfully
- [ ] Browser cache cleared

**If all checked**: Auto-login should work!

---

## 🆘 STILL NOT WORKING?

### Get Detailed Error Information

1. Open browser console (F12)
2. Copy ALL error messages (red text)
3. Go to Network tab
4. Find the failed `auth/login` request
5. Click on it
6. Copy the Response body
7. Share these details for further diagnosis

### Quick Reset

Try this complete reset:
```bash
# 1. Stop all servers (Ctrl+C in both terminals)

# 2. Clear browser data
# - Open DevTools (F12)
# - Application → Clear storage → Clear site data

# 3. Restart MongoDB
net start MongoDB

# 4. Restart Backend
cd backend
npm start

# 5. Restart Frontend
cd frontend
npm start

# 6. Hard refresh browser (Ctrl+Shift+R)

# 7. Open http://localhost:3000
```

---

## 📞 NEXT STEPS

If auto-login still fails after trying all solutions:

1. **Test manual login**: Try logging in manually with admin@example.com / Admin@123
2. **Check backend logs**: Look for errors in backend terminal
3. **Verify database**: Ensure user exists in MongoDB
4. **Check network**: Ensure no firewall blocking localhost

---

**Last Updated**: February 10, 2026
