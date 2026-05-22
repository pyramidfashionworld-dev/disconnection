# ✅ PowerTrack — Deployment Guide (All Bugs Fixed)

## 🐛 Bugs Found & Fixed

| File | Bug | Fix Applied |
|------|-----|-------------|
| `vite_config.js` | Wrong filename (underscore) | Renamed → `vite.config.js` |
| `_gitignore` | Wrong filename (underscore) | Renamed → `.gitignore` |
| `vite.config.js` | `minify: 'terser'` — terser not installed | Changed to `minify: 'esbuild'` |
| `vercel.json` | `"public": false` — requires Vercel Pro | Removed that line |
| `vercel.json` | No SPA rewrites rule | Added `rewrites` for React Router |

---

## 📁 Step 1 — Replace These Files In Your Project

Download the 4 fixed files from the outputs and place them in your project root:

```
your-project/
├── .gitignore          ← REPLACE (was _gitignore)
├── vite.config.js      ← REPLACE (was vite_config.js)
├── vercel.json         ← REPLACE
├── package.json        ← Already correct, keep as is
├── index.html          ← Already correct, keep as is
└── src/
    └── (your React files)
```

> ⚠️ Delete the old `_gitignore` and `vite_config.js` files — they do nothing
> with underscore names. Rename/replace with the corrected files.

---

## 💻 Step 2 — Test Locally First

Open a terminal inside your project folder and run:

```bash
# Install all dependencies
npm install

# Test the build (this is exactly what Vercel will run)
npm run build
```

You should see output like:
```
✓ built in 5.23s
dist/index.html   0.50 kB
dist/assets/...   xxx kB
```

If the build succeeds locally, it **will** succeed on Vercel.

```bash
# Preview the production build in your browser
npm run preview
# Open: http://localhost:4173
```

---

## 🐙 Step 3 — Push to GitHub

```bash
# If starting fresh
git init
git add .
git commit -m "Initial commit: PowerTrack"

# Connect to your GitHub repo (replace with your actual URL)
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
git branch -M main
git push -u origin main
```

If you've already done `git init` before:
```bash
git add .
git commit -m "Fix: corrected config files for Vercel deployment"
git push origin main
```

### ✅ Verify on GitHub
Visit your repo URL — you should see all your files including:
- `vite.config.js` (with a dot, not underscore)
- `.gitignore` (with a dot, not underscore)
- `vercel.json`
- `src/` folder with your React components
- **No** `node_modules/` folder (the .gitignore excludes it)

---

## 🚀 Step 4 — Deploy on Vercel

1. Go to **https://vercel.com** and log in
2. Click **"Add New…"** → **"Project"**
3. Click **"Import Git Repository"**
4. Find and select your repo (e.g. `littlesworld-web`)
5. Vercel will auto-detect the settings — **verify these match exactly:**

   | Setting | Value |
   |---------|-------|
   | Framework Preset | `Vite` |
   | Build Command | `npm run build` |
   | Output Directory | `dist` |
   | Install Command | `npm install` |

6. Click **"Deploy"**
7. Wait 2–4 minutes for the green ✅

---

## 🔍 Step 5 — Verify Your Live Site

Once deployed, Vercel gives you a URL like:
```
https://your-project-name-xxxxx.vercel.app
```

Test these:
- [ ] Page loads (no 404)
- [ ] Login works: `admin@utility.com` / `admin123`
- [ ] Navigating between pages works (React Router)
- [ ] No red errors in browser console (F12)

---

## 🔄 Future Updates

Every time you make changes:
```bash
git add .
git commit -m "describe your change"
git push origin main
# Vercel auto-redeploys in ~2 minutes
```

---

## 🆘 If Something Still Goes Wrong

### Build fails on Vercel
Run `npm run build` locally first. If it fails locally, fix the error before pushing.

### Page shows 404 on navigation
The `vercel.json` rewrites rule handles this. Make sure your `vercel.json` has:
```json
"rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
```

### GitHub push asks for password
Use a Personal Access Token:
1. Go to https://github.com/settings/tokens
2. Generate new token → check `repo` scope → copy it
3. Use the token as your password when prompted

---

## 🔑 Demo Credentials
```
Admin:  admin@utility.com  /  admin123
User 1: rajesh@utility.com /  user123
User 2: priya@utility.com  /  user123
```
