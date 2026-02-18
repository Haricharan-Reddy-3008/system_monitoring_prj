# System Monitoring Platform

🖥️ **Real-Time System Monitoring with AI Predictions**

A production-ready monitoring platform that combines real-time metrics visualization, AI-powered predictive analytics, anomaly detection, log pattern analysis, and intelligent alerting.

## 🎯 Features

- ✅ **Real-time Metrics Visualization** - Live charts for CPU, memory, requests, errors
- ✅ **AI-Powered Predictions** - Predict system behavior for next 30 minutes
- ✅ **Anomaly Detection** - Automatic detection of unusual patterns
- ✅ **Log Pattern Analysis** - Group and analyze recurring log messages
- ✅ **AI Explanations** - Natural language explanations of detected issues
- ✅ **Recommended Actions** - Actionable steps to resolve problems
- ✅ **Slack Alerts** - Automatic notifications when anomalies detected
- ✅ **Multi-Project Support** - Monitor multiple systems independently

## 🛠️ Technology Stack

### Frontend
- **React 18** with **Vite** - Fast development, optimized builds
- **TypeScript** - Type safety and better DX
- **Tailwind CSS** - Utility-first styling
- **Recharts** - Beautiful, composable charts
- **React Router** - Client-side routing

### Backend
- **Python 3.11+** with **FastAPI** - Modern, fast, async API
- **Supabase** - PostgreSQL database + authentication
- **Google Gemini API** - AI predictions and explanations (FREE tier)
- **Slack SDK** - Alert delivery

## 📦 Project Structure

```
system_monotoring_Prj/
├── frontend/          # React + Vite frontend
├── backend/           # Python FastAPI backend
└── scripts/           # Utility scripts (data generators, agents)
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.11+
- **Supabase** account (free tier)
- **Gemini API** key (free tier)

### 1. Clone and Setup

```bash
cd system_monotoring_Prj
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment template
copy .env.example .env
# Edit .env with your credentials

# Run backend server
uvicorn app.main:app --reload --port 8000
```

Backend will be available at `http://localhost:8000`
API docs at `http://localhost:8000/docs`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy environment template
copy .env.example .env
# Edit .env with your Supabase credentials

# Run development server
npm run dev
```

Frontend will be available at `http://localhost:5173`

### 4. Database Setup

1. Create a Supabase project at https://supabase.com
2. Run the SQL schema from `backend/app/schema.sql` in Supabase SQL Editor
3. Copy your Supabase URL and keys to `.env` files

## 📊 Usage

### Development (Simulated Data)

1. Start backend: `uvicorn app.main:app --reload`
2. Start frontend: `npm run dev`
3. Run dummy data generator: `python scripts/dummy_data_generator.py`
4. Open `http://localhost:5173` and login
5. Create a project and view the dashboard

### Production (Real Data)

1. Deploy backend (e.g., Railway, Render, AWS)
2. Deploy frontend (e.g., Vercel, Netlify)
3. Install monitoring agent on your server
4. Configure agent with your API URL and project ID
5. Real metrics will flow to your dashboard

## 🎨 Screenshots

(Screenshots will be added after UI is built)

## 📖 Documentation

- [Project Analysis](./docs/project_analysis.md) - Core concepts and architecture
- [Technology Stack](./docs/technology_stack.md) - Detailed tech stack explanation
- [Implementation Plan](./docs/implementation_plan.md) - Step-by-step development guide
- [Real-World Integration](./docs/real_world_integration.md) - How to use real data

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 🚢 Deployment

### Backend (Railway/Render)
```bash
# Railway
railway up

# Render
# Connect your GitHub repo and deploy
```

### Frontend (Vercel)
```bash
cd frontend
vercel
```

## 🔑 Environment Variables

### Frontend (`.env`)
```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=http://localhost:8000
```

### Backend (`.env`)
```env
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-service-role-key
GEMINI_API_KEY=your-gemini-key
SLACK_WEBHOOK_URL=your-slack-webhook
```

## 🤝 Contributing

This is a college project, but contributions are welcome!

## 📄 License

MIT License

## 👨‍💻 Author

Built as a demonstration of production-ready system monitoring with AI integration.

---

**Note**: This platform currently uses simulated data for demonstration. The entire pipeline (ingestion, storage, analysis, prediction, alerting) is production-ready. To switch to real data, simply deploy a monitoring agent on your target server—no code changes needed!
