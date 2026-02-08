# Quick Test Guide - Authentication Fix

## 🚀 Quick Start Testing

### Test 1: Basic Login (2 minutes)
```
1. Open http://localhost:3000/login
2. Enter: admin@example.com / Admin@123
3. Click "Sign In"
4. ✅ Should redirect to /admin/dashboard
5. ✅ Should NOT redirect back to login
```

### Test 2: Quick Actions - Not Logged In (1 minute)
```
1. Logout (if logged in)
2. Go to login page
3. Click "Manage Employees" quick action
4. ✅ Should show toast: "Login required to access this feature"
5. ✅ Should stay on login page
```

### Test 3: Quick Actions - Logged In (1 minute)
```
1. Login successfully
2. Go back to login page (if redirected away)
3. Click "Manage Employees" quick action
4. ✅ Should navigate to /employees page
5. ✅ Should NOT show "Login required" message
```

### Test 4: Protected Routes (2 minutes)
```
1. Logout completely
2. Try to access: http://localhost:3000/employees
3. ✅ Should redirect to /login
4. Login with valid credentials
5. ✅ Should redirect to dashboard
6. Navigate to /employees manually
7. ✅ Should load employees page successfully
```

### Test 5: Token Persistence (1 minute)
```
1. Login successfully
2. Press F5 to refresh page
3. ✅ Should stay logged in
4. ✅ Should NOT redirect to login
5. Open DevTools > Application > Local Storage
6. ✅ Should see 'accessToken' and 'refreshToken'
```

## 🐛 Debug Commands

### Check Auth State
Open browser console and run:
```javascript
// Check localStorage
console.log('Access Token:', localStorage.getItem('accessToken'));
console.log('Refresh Token:', localStorage.getItem('refreshToken'));

// Check if token is valid
const token = localStorage.getItem('accessToken');
if (token) {
  const payload = JSON.parse(atob(token.split('.')[1]));
  console.log('Token Payload:', payload);
  console.log('Token Expires:', new Date(payload.exp * 1000));
  console.log('Current Time:', new Date());
  console.log('Is Expired:', Date.now() > payload.exp * 1000);
}
```

### Clear Auth State
If you need to reset:
```javascript
localStorage.removeItem('accessToken');
localStorage.removeItem('refreshToken');
location.reload();
```

## 📊 Expected Behavior

| Action | Expected Result |
|--------|----------------|
| Login with valid credentials | Redirect to dashboard, no bounce back |
| Login with invalid credentials | Show error message, stay on login |
| Access protected route (not logged in) | Redirect to login |
| Access protected route (logged in) | Show page content |
| Click Quick Action (not logged in) | Show "Login required" toast |
| Click Quick Action (logged in) | Navigate to page |
| Refresh page (logged in) | Stay logged in |
| Logout | Clear tokens, redirect to login |

## ⚠️ Common Issues

### Issue: Redirects back to login after successful login
**Fix**: Check if backend is returning correct response structure
```javascript
// Backend should return:
{
  success: true,
  data: {
    accessToken: "...",
    refreshToken: "...",
    user: { id, name, email, role, permissions }
  }
}
```

### Issue: Quick Actions not working
**Fix**: Make sure you're testing with the updated code
```bash
# Restart frontend
cd frontend
npm start
```

### Issue: Token expired immediately
**Fix**: Check system time and backend token expiry settings

## 🎯 Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@example.com | Admin@123 |
| HR | hr@example.com | Hr@123 |
| Viewer | viewer@example.com | Viewer@123 |

## ✅ Success Criteria

All tests pass when:
- ✅ Login redirects to dashboard without bouncing back
- ✅ Quick Actions work for logged-in users
- ✅ Quick Actions show "Login required" for non-logged-in users
- ✅ Protected routes are accessible after login
- ✅ Tokens persist across page refreshes
- ✅ Role-based access control works correctly

---

**Time to Complete**: ~10 minutes
**Difficulty**: Easy
**Prerequisites**: Backend running, Frontend running
