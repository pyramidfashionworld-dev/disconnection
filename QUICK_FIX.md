# 🆘 IMMEDIATE FIX: Missing "preview" Script

## The Problem
```
npm error Missing script: "preview"
```

Your `package.json` is incomplete.

---

## 🎯 The 60-Second Fix

### **COPY YOUR CORRECTED package.json:**

📌 **Copy everything below** (from `{` to the last `}`)

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

### **DO THIS:**

1. Open your `package.json` file
2. Select All: `Ctrl + A`
3. Delete: `Delete` key
4. Paste the corrected content above
5. Save: `Ctrl + S`

---

## ✅ Verify It Works

### In your terminal:
```bash
# Delete old modules
rmdir /s node_modules

# Clean cache
npm cache clean --force

# Reinstall everything
npm install

# Test it works
npm run dev
```

Expected: App starts at `http://localhost:5173` ✅

---

## 📋 Before Deployment Checklist

```bash
# 1. Verify scripts exist
npm run
# Should show: dev, build, preview, start

# 2. Development mode
npm run dev
# Visit: http://localhost:5173
# Test login: admin@utility.com / admin123
# Press Ctrl+C to stop

# 3. Production build
npm run build
# Creates: dist/ folder

# 4. Test production locally
npm run preview
# Visit: http://localhost:4173
# Verify everything works

# 5. Push to GitHub
git add .
git commit -m "Fix: Added missing preview script"
git push origin main

# 6. Deploy to Vercel
# Go to https://vercel.com
# Import your GitHub repo
# Click Deploy
```

---

## 🚀 After All Tests Pass

Your URL will be: `https://powertrack-xxxxx.vercel.app`

Share it! 🎉

---

## 📞 Quick Help

| Error | Fix |
|-------|-----|
| Port 5173 in use | `npm run dev -- --port 3000` |
| Module not found | `npm install && npm cache clean --force` |
| Can't find package.json | Use correct project folder |
| Ctrl+C doesn't stop server | Try `Ctrl+C` again or close terminal |

---

**Status:** Ready to deploy once tests pass ✅
