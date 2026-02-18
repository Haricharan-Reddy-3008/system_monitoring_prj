# System Monitoring Platform - Backend

Python FastAPI backend for real-time system monitoring with AI predictions.

## Setup

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run development server
uvicorn app.main:app --reload --port 8000
```

## API Endpoints

- `POST /api/metrics` - Ingest metrics data
- `POST /api/logs` - Ingest log data
- `GET /api/predictions/{project_id}` - Get AI predictions
- `GET /api/anomalies/{project_id}` - Get detected anomalies
- `GET /api/explanations/{project_id}` - Get AI explanations

## Environment Variables

Create a `.env` file:

```env
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-service-role-key
GEMINI_API_KEY=your-gemini-api-key
SLACK_WEBHOOK_URL=your-slack-webhook-url
CORS_ORIGINS=http://localhost:5173
```
