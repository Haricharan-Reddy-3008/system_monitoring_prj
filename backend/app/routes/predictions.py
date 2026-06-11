from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from app.database import get_supabase
from supabase import Client

router = APIRouter()

class PredictionData(BaseModel):
    project_id: str

@router.get("/predictions/{project_id}")
async def get_predictions(project_id: str, supabase: Client = Depends(get_supabase)):
    """Get AI predictions for next 30 minutes"""
    try:
        # Get recent metrics for context
        metrics_result = supabase.table("metrics") \
            .select("*") \
            .eq("project_id", project_id) \
            .order("timestamp", desc=True) \
            .limit(60) \
            .execute()
        
        if not metrics_result.data:
            raise HTTPException(status_code=404, detail="No metrics found for this project")
        
        metrics = metrics_result.data
        
        # Calculate trend-based predictions
        recent_metrics = sorted(metrics, key=lambda x: x['timestamp'])
        
        avg_cpu = sum(m['cpu'] for m in recent_metrics) / len(recent_metrics)
        avg_memory = sum(m['memory'] for m in recent_metrics) / len(recent_metrics)
        avg_requests = sum(m['requests'] for m in recent_metrics) / len(recent_metrics)
        avg_errors = sum(m['errors'] for m in recent_metrics) / len(recent_metrics)
        
        # Simple trend: use last 3 to predict next
        if len(recent_metrics) >= 3:
            cpu_trend = (recent_metrics[-1]['cpu'] - recent_metrics[-3]['cpu']) / 3
            memory_trend = (recent_metrics[-1]['memory'] - recent_metrics[-3]['memory']) / 3
            requests_trend = (recent_metrics[-1]['requests'] - recent_metrics[-3]['requests']) / 3
            errors_trend = (recent_metrics[-1]['errors'] - recent_metrics[-3]['errors']) / 3
        else:
            cpu_trend = memory_trend = requests_trend = errors_trend = 0
        
        # Predict next values (capped at reasonable limits)
        predicted_cpu = min(100, max(0, avg_cpu + cpu_trend * 5))
        predicted_memory = min(100, max(0, avg_memory + memory_trend * 5))
        predicted_requests = max(0, int(avg_requests + requests_trend * 5))
        predicted_errors = max(0, int(avg_errors + errors_trend * 5))
        
        return {
            "project_id": project_id,
            "time_horizon": "30 minutes",
            "current": {
                "cpu": round(avg_cpu, 2),
                "memory": round(avg_memory, 2),
                "requests": int(avg_requests),
                "errors": int(avg_errors)
            },
            "predicted": {
                "cpu": round(predicted_cpu, 2),
                "memory": round(predicted_memory, 2),
                "requests": predicted_requests,
                "errors": predicted_errors
            },
            "trends": {
                "cpu": round(cpu_trend, 4),
                "memory": round(memory_trend, 4),
                "requests": round(requests_trend, 4),
                "errors": round(errors_trend, 4)
            },
            "confidence": "medium"
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error generating predictions: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/predictions/{project_id}/generate")
async def generate_detailed_predictions(project_id: str, supabase: Client = Depends(get_supabase)):
    """Generate detailed predictions using Gemini AI"""
    try:
        # This would call Google Gemini API for ML-based predictions
        # For now, return a placeholder
        return {
            "project_id": project_id,
            "message": "AI predictions endpoint - requires Gemini API configuration",
            "status": "pending"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
