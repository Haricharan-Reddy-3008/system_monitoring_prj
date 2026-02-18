# 🧪 Testing Your Monitoring Platform

## Quick Test Guide

### Step 1: Start the Backend Server

Open a terminal in the `backend` folder and run:

```powershell
# Activate virtual environment
venv\Scripts\activate

# Start FastAPI server
py -m uvicorn app.main:app --reload --port 8000
```

**What to look for:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

✅ If you see this, backend is working!

**Test the backend:**
- Open browser: http://localhost:8000
- You should see: `{"message": "System Monitoring API", "version": "1.0.0", "docs": "/docs"}`
- Visit http://localhost:8000/docs to see API documentation

### Step 2: Start the Frontend Server

Open a **NEW terminal** in the `frontend` folder and run:

```powershell
npm run dev
```

**What to look for:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

✅ If you see this, frontend is working!

### Step 3: Test the Application

1. **Open browser:** http://localhost:5173

2. **You should see:** Login page with "System Monitoring Platform" title

3. **Test Sign Up:**
   - Enter email: `test@example.com`
   - Enter password: `password123`
   - Click **Sign Up**
   - Check your email for confirmation link
   - Click the confirmation link

4. **Test Sign In:**
   - Go back to http://localhost:5173
   - Enter same email and password
   - Click **Sign In**
   - You should be redirected to Projects page

5. **Test Create Project:**
   - Click **New Project** button
   - Enter project name: `My Test Project`
   - Click **Create Project**
   - You should see the dashboard

## ✅ Success Checklist

- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] Login page loads at http://localhost:5173
- [ ] Can sign up with email
- [ ] Receive confirmation email
- [ ] Can sign in after confirming
- [ ] Projects page shows after login
- [ ] Can create a new project
- [ ] Dashboard loads for the project

## 🐛 Troubleshooting

### Backend Issues

**Error: "No module named 'app'"**
- Make sure you're in the `backend` folder
- Make sure virtual environment is activated

**Error: "SUPABASE_URL not found"**
- Check `backend/.env` file exists
- Make sure it has your Supabase credentials

**Port 8000 already in use:**
```powershell
# Use a different port
py -m uvicorn app.main:app --reload --port 8001
```

### Frontend Issues

**Error: "Cannot find module"**
- Run `npm install` again in frontend folder

**Blank page or errors:**
- Open browser console (F12)
- Check for error messages
- Make sure backend is running

**Port 5173 already in use:**
- The terminal will show an alternative port
- Use that port instead

### Database Issues

**"Failed to fetch" errors:**
- Make sure you ran `schema_update.sql` in Supabase
- Check Supabase project is active
- Verify `.env` files have correct credentials

**Can't sign up:**
- Check Supabase Auth is enabled
- Go to Supabase Dashboard → Authentication → Settings
- Make sure "Enable email confirmations" is configured

## 📊 What Each Part Does

```
Browser (http://localhost:5173)
    ↓
Frontend (React + Vite)
    ↓ API calls
Backend (http://localhost:8000)
    ↓ Database queries
Supabase (PostgreSQL + Auth)
```

## 🎯 Quick Health Check Commands

**Check if backend is running:**
```powershell
curl http://localhost:8000
```

**Check if frontend is running:**
```powershell
curl http://localhost:5173
```

## 📝 Next Steps After Testing

Once everything works:
1. ✅ Authentication is working
2. ✅ Projects can be created
3. 🚧 Build metrics ingestion API
4. 🚧 Create real-time charts
5. 🚧 Add AI predictions
6. 🚧 Implement anomaly detection

---

**Need help?** Check the error messages in:
- Backend terminal (for API errors)
- Frontend terminal (for build errors)
- Browser console (F12) (for runtime errors)
