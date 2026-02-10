# 🚀 Quick Reference Card

## Commands

```bash
# Development
npm run dev              # Start dev server

# Build
npm run build           # Build for production
npm run preview         # Preview production build

# Deploy
npm run deploy          # Build + deploy everything
npm run deploy:hosting  # Deploy only hosting
deploy.bat              # Windows one-click deploy

# Firebase
firebase login          # Login to Firebase
firebase use            # Select project
firebase projects:list  # List projects
```

## Routes

| Route | Access | Description |
|-------|--------|-------------|
| `/` | Public | Login page |
| `/login` | Public | Login page |
| `/dashboard` | Protected | Main dashboard |
| `/profile` | Protected | User profile |
| `/settings` | Protected | App settings |
| `/404` | Public | Not found page |

## File Structure

```
src/
├── components/
│   ├── auth/           # Auth components
│   ├── common/         # Shared components
│   ├── dashboard/      # Dashboard components
│   └── data/           # Data components
├── pages/              # Page components
├── contexts/           # React contexts
├── services/           # API services
├── types/              # TypeScript types
├── utils/              # Utility functions
└── App.tsx             # Main app component
```

## Key Components

```typescript
// Use authentication
import { useAuth } from './contexts/AuthContext';
const { currentUser, login, logout } = useAuth();

// Navigate
import { useNavigate } from 'react-router-dom';
const navigate = useNavigate();
navigate('/profile');

// Protected route
<ProtectedRoute>
  <YourComponent />
</ProtectedRoute>
```

## Environment Variables

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
```

## Deployment Steps

1. **Login:** `firebase login`
2. **Build:** `npm run build`
3. **Deploy:** `firebase deploy`

**Or just:** `npm run deploy`

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Build fails | Check TypeScript errors |
| Deploy fails | Run `firebase login` |
| 404 on refresh | Check `firebase.json` rewrites |
| Auth not working | Check Firebase Console settings |
| Env vars not working | Restart dev server |

## Documentation Files

- `DEPLOYMENT_GUIDE.md` - Full deployment guide
- `QUICK_DEPLOY.md` - 3-step deployment
- `FEATURES.md` - Feature documentation
- `DEPLOYMENT_CHECKLIST.md` - Deployment checklist
- `WHATS_NEW.md` - What's new overview
- `ENHANCEMENTS_SUMMARY.md` - Technical summary

## URLs

- **Firebase Console:** https://console.firebase.google.com
- **Your App:** https://YOUR-PROJECT-ID.web.app
- **Firebase Docs:** https://firebase.google.com/docs

## Quick Tips

💡 Use lazy loading for better performance  
💡 Test locally before deploying  
💡 Keep `.env` out of git  
💡 Check Firebase Console for errors  
💡 Use TypeScript for type safety  

## Support

1. Check documentation files
2. Review Firebase Console
3. Check browser console
4. Verify `.env` configuration

---

**Need help? See full documentation in the docs folder.**
