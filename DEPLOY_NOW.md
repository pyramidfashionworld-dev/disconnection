# PowerTrack → Vercel Deployment Guide

## Step 1 — Replace Files in Your Project Root

Copy these 4 files from the outputs folder into your project root,
replacing whatever was there before:

| Download File    | Goes To (in your project) | Why                                      |
|------------------|---------------------------|------------------------------------------|
| vite.config.js   | vite.config.js            | Fixes chunking — replaces vite_config.js |
| .gitignore       | .gitignore                | Fixes naming — replaces _gitignore       |
| vercel.json      | vercel.json               | Already correct, keep as is             |
| package.json     | package.json              | Already correct, keep as is             |

> ⚠️ DELETE the old `vite_config.js` and `_gitignore` from your project.
> Files with underscore prefixes are invisible to Vite and Git.

Your project root should now have:
```
your-project/
├── .gitignore          ✅ dot prefix (not underscore)
├── vite.config.js      ✅ dot prefix (not underscore)
├── vercel.json         ✅
├── package.json        ✅
├── index.html          ✅
└── src/
    ├── index.jsx       ← entry point
    ├── App.jsx
    └── ...
```

---

## Step 2 — Test Locally Before Pushing

Open a terminal in your project folder and run:

```bash
# Install / refresh dependencies
npm install

# Test the production build (same thing Vercel will run)
npm run build
```

Expected output — no errors, chunks split:
```
dist/assets/react-vendor-xxxx.js    ~141 kB
dist/assets/router-xxxx.js          ~30  kB
dist/assets/charts-xxxx.js          ~280 kB
dist/assets/xlsx-xxxx.js            ~250 kB
dist/assets/index-xxxx.js           ~180 kB   ← much smaller now
```

Then verify it looks right in a browser:
```bash
npm run preview
# Open: http://localhost:4173
```

---

## Step 3 — Push to GitHub

```bash
# Stage everything (including the newly renamed files)
git add .

# Commit
git commit -m "Fix: correct config file names and chunking"

# Push
git push origin main
```

If prompted for a password, use a Personal Access Token:
1. Go to https://github.com/settings/tokens
2. Generate new token (classic) → check `repo` scope
3. Copy the token and paste it as your password

Verify at your repo URL that all files are visible and `.gitignore` / `vite.config.js`
appear with their correct names.

---

## Step 4 — Deploy on Vercel

1. Go to https://vercel.com and log in
2. Click **Add New → Project**
3. Find your repo and click **Import**
4. Verify these settings (Vercel auto-detects from your vercel.json):

   | Setting          | Expected Value  |
   |------------------|-----------------|
   | Framework        | Vite            |
   | Build Command    | npm run build   |
   | Output Directory | dist            |
   | Install Command  | npm install     |

5. Click **Deploy** and wait ~2 minutes for the green ✅

---

## Step 5 — Verify the Live Site

Once deployed you get a URL like:
```
https://your-project-name-xxxxx.vercel.app
```

Test:
- [ ] Page loads (no 404)
- [ ] Login works: admin@utility.com / admin123
- [ ] Navigate between pages (React Router routes work)
- [ ] No red errors in browser console (F12)
- [ ] Charts and tables render correctly

---

## Future Updates

Every time you make a change:
```bash
git add .
git commit -m "describe the change"
git push origin main
# Vercel auto-redeploys in ~2 minutes
```

---

## Credentials

```
Admin:  admin@utility.com  /  admin123
User 1: rajesh@utility.com /  user123
User 2: priya@utility.com  /  user123
```
