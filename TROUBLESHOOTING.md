# Vercel Deployment Troubleshooting Guide

## Common Issues & Solutions

---

## ❌ Issue 1: Build Fails with "Module not found"

### Error Message:
```
Error: Cannot find module 'react'
```

### Causes:
- Missing `package.json`
- Dependencies not installed
- Typo in import statements

### Solutions:

**Option 1: Reinstall Dependencies**
```bash
# Remove node_modules
rm -rf node_modules
# Or on Windows
rmdir /s node_modules

# Reinstall
npm install

# Rebuild
npm run build
```

**Option 2: Check package.json**
Ensure your `package.json` includes:
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.1",
    "tailwindcss": "^3.4.1",
    "vite": "^5.1.4"
  }
}
```

**Option 3: Clear Vercel Cache**
1. Go to Vercel Dashboard
2. Project Settings → Git
3. Click "Clear all" in Build Cache
4. Trigger a redeploy

---

## ❌ Issue 2: Page Shows "404 Not Found"

### Error Message:
```
404 - This page could not be found
```

### Causes:
- Missing `index.html` in root
- Wrong `outputDirectory` in `vercel.json`
- Vite configuration issues

### Solutions:

**Option 1: Verify Project Structure**
```
your-project/
├── index.html          ← MUST be in root!
├── src/
│   ├── main.jsx
│   └── App.jsx
├── package.json
└── vite.config.js
```

**Option 2: Check vercel.json**
```json
{
  "buildCommand": "npm run build",
  "framework": "vite",
  "outputDirectory": "dist"  ← Check this is "dist"
}
```

**Option 3: Check vite.config.js Exports**
```javascript
export default defineConfig({
  plugins: [react()],
  // ... other config
})
```

**Option 4: Check if dist folder is created**
```bash
npm run build
ls dist/          # Should show index.html
```

---

## ❌ Issue 3: Styles Not Loading (Tailwind CSS Missing)

### Symptoms:
- Page looks unstyled (no colors, layout broken)
- Console shows no errors
- Works locally but not on Vercel

### Solutions:

**Option 1: Verify Tailwind Installation**
```bash
npm install -D tailwindcss postcss autoprefixer

# Create config files
npx tailwindcss init -p
```

**Option 2: Check tailwind.config.js**
```javascript
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",  ← Include src folder
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

**Option 3: Verify index.css**
Your `src/index.css` must have:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**Option 4: Check CSS is imported in main.jsx**
In `src/main.jsx`:
```javascript
import './index.css'  ← Must be imported!
import App from './App.jsx'
```

---

## ❌ Issue 4: Images/Assets Not Loading

### Symptoms:
- Images show broken icon
- Favicon not displaying
- Other assets (SVG, fonts) missing

### Solutions:

**Option 1: Use Correct Paths**
Wrong:
```jsx
<img src="image.png" />
<img src="../public/image.png" />
```

Correct:
```jsx
<img src="/image.png" />
<img src={import.meta.env.BASE_URL + 'image.png'} />
```

**Option 2: Place Assets in Public Folder**
```
your-project/
├── public/
│   ├── favicon.svg
│   └── images/
│       └── logo.png
```

**Option 3: Check index.html Favicon Path**
```html
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
```

---

## ❌ Issue 5: Environment Variables Not Working

### Symptoms:
- `process.env.VARIABLE` is undefined
- `import.meta.env.VARIABLE` returns undefined

### Solutions:

**Option 1: Use Vite Environment Variables**
Only variables starting with `VITE_` work in Vite:

In `.env`:
```
VITE_API_URL=https://api.example.com
VITE_APP_NAME=PowerTrack
```

In your code:
```javascript
const apiUrl = import.meta.env.VITE_API_URL
const appName = import.meta.env.VITE_APP_NAME
```

**Option 2: Set in Vercel Dashboard**
1. Go to Project Settings
2. Environment Variables
3. Add: `VITE_API_URL` = `https://api.example.com`
4. Redeploy

**Option 3: Create .env.example**
```
VITE_API_URL=
VITE_API_KEY=
```

For team collaboration without exposing secrets.

---

## ❌ Issue 6: Data Not Persisting (localStorage)

### Symptoms:
- Data disappears after page refresh
- Login doesn't stay logged in

### Solutions:

**For Demo/Test**: This is expected behavior. Demo data uses `localStorage` which:
- ✅ Works during a browser session
- ❌ Clears when browser cache is cleared
- ❌ Different across devices/browsers

**For Production**: Connect to a real database:

**Option 1: Firebase Firestore**
```bash
npm install firebase
```

```javascript
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseApp = initializeApp({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  // ... other config
});

const db = getFirestore(firebaseApp);
```

**Option 2: Supabase (PostgreSQL)**
```bash
npm install @supabase/supabase-js
```

**Option 3: MongoDB + Express Backend**
Create a separate backend API and call it from React.

---

## ❌ Issue 7: CORS Error (Cross-Origin)

### Error Message:
```
Access to XMLHttpRequest at 'https://api.example.com' from origin 'https://powertrack-xxx.vercel.app' 
has been blocked by CORS policy
```

### Solutions:

**Option 1: Configure Backend CORS**
In your backend (Node.js/Express):
```javascript
const cors = require('cors');
app.use(cors({
  origin: 'https://powertrack-xxx.vercel.app',
  credentials: true
}));
```

**Option 2: Use Vercel Proxy (API Routes)**
Create `vercel.json`:
```json
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://your-api.com/$1"
    }
  ]
}
```

**Option 3: Use a CORS Proxy**
```javascript
const response = await fetch(
  'https://cors-anywhere.herokuapp.com/https://api.example.com/data'
);
```

---

## ❌ Issue 8: Deployment Hangs or Timeout

### Symptoms:
- Build takes too long (>15 minutes)
- Deployment gets stuck
- Error: "Function timed out"

### Solutions:

**Option 1: Check for Large Dependencies**
```bash
npm ls
npm bundle-report
```

Remove unused packages.

**Option 2: Optimize Build**
In `vite.config.js`:
```javascript
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react': ['react', 'react-dom'],
        },
      },
    },
  },
})
```

**Option 3: Increase Timeout**
In `vercel.json`:
```json
{
  "buildCommand": "npm run build",
  "functions": {
    "api/**": {
      "maxDuration": 60
    }
  }
}
```

---

## ❌ Issue 9: "Cannot find module in vercel.json"

### Error Message:
```
Error: Invalid build command. The build command vercel.json is not executable.
```

### Solutions:

**Option 1: Verify vercel.json Syntax**
```bash
# Validate JSON
npm install -g jsonlint
jsonlint vercel.json
```

**Option 2: Check vercel.json Location**
Must be in project root:
```
your-project/
├── vercel.json     ← Here!
├── package.json
└── src/
```

**Option 3: Simplify vercel.json**
```json
{
  "buildCommand": "npm run build",
  "framework": "vite",
  "outputDirectory": "dist"
}
```

---

## ❌ Issue 10: "Error: Unexpected token"

### Symptoms:
- Syntax error in build
- Error in specific file

### Solutions:

**Option 1: Check for Typos**
- Missing commas in objects
- Missing parentheses in functions
- Incorrect JSX syntax

**Option 2: Verify Node Version**
```bash
node --version  # Should be >=16.0.0
```

Update if needed:
```bash
npm install -g n
n latest
```

**Option 3: Check for Mixed ESM/CommonJS**
In `package.json`:
```json
{
  "type": "module",  ← Add this if missing
  "dependencies": {}
}
```

---

## General Debugging Tips

### 1. Check Vercel Build Logs
1. Go to Vercel Dashboard
2. Click your project
3. Go to "Deployments"
4. Click the failed deployment
5. Scroll to see full error logs

### 2. Run Exact Build Locally
```bash
npm install
npm run build
npm run preview
```

If it works locally, issue is likely environment-specific.

### 3. Clear Cache & Retry
```bash
# In Vercel Dashboard:
Settings → Git → Clear All Build Cache
# Then trigger redeploy
```

### 4. Check Node Modules
```bash
# Ensure all dependencies are installed
npm install

# Verify no peer dependency warnings
npm ls --depth=0

# Fix any issues
npm audit fix
```

### 5. Check Console & Network Tabs
1. Open deployed site
2. Press F12 (DevTools)
3. Check **Console** tab for JavaScript errors
4. Check **Network** tab for failed requests
5. Check **Application** tab for localStorage/cookies

---

## When All Else Fails

### Nuclear Option: Fresh Deploy
```bash
# In Vercel Dashboard
1. Go to Project Settings
2. Advanced → Delete Project
3. Re-import from GitHub
4. Verify all settings
5. Redeploy
```

### Get Help
- **Vercel Support**: https://vercel.com/support
- **Vite Issues**: https://github.com/vitejs/vite/issues
- **React Docs**: https://react.dev
- **Stack Overflow**: Tag with `vercel`, `vite`, `react`

---

## Success Checklist

After deploying, verify:
- [ ] App loads without 404
- [ ] Console has no errors
- [ ] Styles are applied (Tailwind working)
- [ ] All pages accessible
- [ ] Forms/buttons work
- [ ] API calls work (if using API)
- [ ] Images/assets load
- [ ] Mobile responsive
- [ ] Login/auth working

**If all pass: Congratulations! Your deployment is successful!** 🎉

---

**Last Updated**: 2024
**Applies to**: Vercel, Vite 5+, React 18+, Node 16+
