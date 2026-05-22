# ⚠️ URGENT: Fix Missing Scripts Issue

## Problem
```
npm error Missing script: "preview"
```

Your `package.json` is incomplete. It's missing the `preview` script needed to test the production build locally.

---

## ✅ Solution: Update Your package.json

### Step 1: Locate Your package.json
Your project structure should have:
```
your-project/
├── package.json          ← Find this file
├── src/
├── index.html
└── vite.config.js
```

### Step 2: Replace Your package.json Content
Open `package.json` in your code editor and **replace everything** with this:

```json
{
  "name": "electricity-monitor",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "start": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.18",
    "postcss": "^8.4.35",
    "tailwindcss": "^3.4.1",
    "vite": "^5.1.4"
  }
}
```

### Step 3: Key Changes Made

| What | Old | New |
|------|-----|-----|
| `"preview"` script | ❌ Missing | ✅ `"vite preview"` |
| `"start"` script | ❌ Missing | ✅ `"vite preview"` |
| `"build"` script | ✅ Present | ✅ Kept same |
| `"dev"` script | ✅ Present | ✅ Kept same |

---

## 🔧 What Each Script Does

```bash
npm run dev       # Run development server (localhost:5173)
npm run build     # Build for production (creates dist folder)
npm run preview   # Preview the production build locally
npm start         # Same as preview (alternative command)
```

---

## 📋 Step-by-Step Walkthrough

### If Using VS Code:

1. **Open VS Code**
   ```
   File → Open Folder → Select your project
   ```

2. **Find package.json**
   - In the File Explorer on left side
   - Click on `package.json`

3. **Replace Content**
   - Select All: `Ctrl+A`
   - Delete: `Delete`
   - Paste the corrected JSON above
   - Save: `Ctrl+S`

### If Using Command Line:

Windows PowerShell:
```powershell
cd C:\Users\Dell\your-project-folder
notepad package.json
```

Replace content, save (Ctrl+S), and close.

---

## 🔄 After Updating package.json

### Step 1: Delete node_modules and reinstall
```bash
# Navigate to your project
cd your-project-path

# Delete node_modules
rmdir /s node_modules
# Or manually delete the node_modules folder

# Clear npm cache
npm cache clean --force

# Reinstall everything
npm install
```

### Step 2: Verify Installation
```bash
# Check all scripts are available
npm run
```

You should see:
```
available scripts:
  dev
  build
  preview
  start
```

### Step 3: Test Development Mode
```bash
npm run dev
```

Should start server at: `http://localhost:5173`

### Step 4: Test Production Build
```bash
npm run build
npm run preview
```

Should be running at: `http://localhost:4173`

---

## ✅ How to Verify It Works

After running each command, check:

### `npm run dev` should:
- ✅ Open browser at `http://localhost:5173`
- ✅ Show your PowerTrack application
- ✅ Live reload when you save files

### `npm run build` should:
- ✅ Create a `dist` folder in your project
- ✅ Finish without errors
- ✅ Show file size summary

### `npm run preview` should:
- ✅ Show: `Local: http://localhost:4173/`
- ✅ You can visit and test your app
- ✅ No hot reload (it's production version)

---

## 🚨 If Still Getting Errors

### Error: "Cannot find module 'vite'"
```bash
npm install --save-dev vite
npm install --save-dev @vitejs/plugin-react
```

### Error: "npm WARN"
It's just a warning, usually safe to ignore. If it blocks:
```bash
npm audit fix
npm audit fix --force
```

### Error: Port already in use
```bash
# Use different port
npm run dev -- --port 3000
npm run preview -- --port 4000
```

---

## 📁 Your Complete Project Structure Should Be

```
your-project/
├── node_modules/              (Created by npm install)
├── src/
│   ├── main.jsx               (Entry point)
│   ├── App.jsx                (Main component)
│   ├── index.css              (Styles)
│   └── ... other files
├── public/
│   └── favicon.svg            (Optional)
├── index.html                 (Root HTML)
├── package.json               ✅ UPDATED
├── package-lock.json          (Auto-generated)
├── vite.config.js             ✅ Must have
├── tailwind.config.js         ✅ Must have
├── postcss.config.js          ✅ Must have
├── .gitignore                 ✅ Must have
└── vercel.json                ✅ Must have (for Vercel)
```

---

## 🎯 Now You Can Deploy!

Once verified locally, proceed with deployment:

1. ✅ Push to GitHub
   ```bash
   git add .
   git commit -m "Fix: Updated package.json with missing scripts"
   git push origin main
   ```

2. ✅ Deploy to Vercel
   - Go to https://vercel.com
   - Import your GitHub repo
   - Click Deploy

---

## 📞 Still Having Issues?

### Check These Files Exist:
- [ ] `package.json` - Updated with preview script
- [ ] `vite.config.js` - Configuration for Vite
- [ ] `tailwind.config.js` - Configuration for Tailwind
- [ ] `postcss.config.js` - Configuration for PostCSS
- [ ] `index.html` - Root HTML file
- [ ] `src/main.jsx` - Entry point
- [ ] `src/App.jsx` - Main component

### Common Mistakes:
- ❌ Edited wrong file
- ❌ Didn't save the file
- ❌ npm_modules not reinstalled
- ❌ Old npm cache interfering
- ❌ Different project folder opened

### Quick Fixes:
```bash
# Force fresh install
npm install --force

# Clear cache
npm cache clean --force

# Reinstall everything
rm -rf node_modules package-lock.json
npm install
```

---

## 🎉 Success!

Once all scripts work locally:
```bash
✅ npm run dev       (Development)
✅ npm run build     (Production build)
✅ npm run preview   (Preview production)
```

You're ready to deploy to Vercel! 🚀

**Next: Follow VERCEL_DEPLOYMENT_GUIDE.md or QUICK_START.md**

---

**Version**: 1.0
**Date**: 2024
**For**: React + Vite + Tailwind CSS projects
