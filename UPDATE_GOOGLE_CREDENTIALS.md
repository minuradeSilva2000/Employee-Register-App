# 🔧 Update Google OAuth Credentials

## 🎯 You need to replace placeholder values with REAL Google credentials

### **Step 1: Get Google Credentials**

1. **Go to**: https://console.cloud.google.com/
2. **Create a project** (if you haven't already)
3. **Set up OAuth consent screen**
4. **Create OAuth client ID** (Web application)
5. **Copy the credentials** you get

### **Step 2: Update Backend Environment**

**File**: `backend/.env`

**Find these lines:**
```env
GOOGLE_CLIENT_ID=your_google_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
```

**Replace with your real credentials:**
```env
GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-AbCdEfGhIjKlMnOpQrStUvWxYz
```

### **Step 3: Update Frontend Environment**

**File**: `frontend/.env`

**Find these lines:**
```env
REACT_APP_GOOGLE_CLIENT_ID=PASTE_YOUR_REAL_CLIENT_ID_HERE.apps.googleusercontent.com
VITE_GOOGLE_CLIENT_ID=PASTE_YOUR_REAL_CLIENT_ID_HERE.apps.googleusercontent.com
```

**Replace with your real Client ID:**
```env
REACT_APP_GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
VITE_GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
```

### **Step 4: Restart Servers**

After updating both files, restart the servers to load new environment variables.

---

## 🚨 **IMPORTANT NOTES:**

- **Client ID** ends with `.apps.googleusercontent.com`
- **Client Secret** is a random string starting with `GOCSPX-`
- **Use the SAME Client ID** in both backend and frontend files
- **Don't include quotes** around the values
- **No extra spaces** before or after the values

---

## ✅ **How to Verify:**

Run this command after updating:
```bash
node check-google-setup.js
```

You should see ✅ green checkmarks instead of ❌ red X marks.