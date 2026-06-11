from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel
from datetime import datetime
from app.database import get_supabase
from supabase import Client

router = APIRouter()

class MetricsIngest(BaseModel):
    project_id: str
    timestamp: datetime
    cpu: float
    memory: float
    requests: int
    errors: int

@router.post("/metrics")
async def ingest_metrics(metrics: MetricsIngest, supabase: Client = Depends(get_supabase)):
    """Ingest metrics data from monitoring agents"""
    try:
        # Validate ranges
        if not 0 <= metrics.cpu <= 100:
            raise HTTPException(status_code=400, detail="CPU must be between 0-100")
        if not 0 <= metrics.memory <= 100:
            raise HTTPException(status_code=400, detail="Memory must be between 0-100")
        if metrics.requests < 0 or metrics.errors < 0:
            raise HTTPException(status_code=400, detail="Requests and errors must be non-negative")
        
        # Insert metrics
        result = supabase.table("metrics").insert({
            "project_id": metrics.project_id,
            "timestamp": metrics.timestamp.isoformat(),
            "cpu": metrics.cpu,
            "memory": metrics.memory,
            "requests": metrics.requests,
            "errors": metrics.errors,
        }).execute()
        
        return {"success": True, "data": result.data}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error ingesting metrics: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/metrics/{project_id}")
async def get_metrics(
    project_id: str,
    limit: int = Query(100, ge=1, le=1000),
    supabase: Client = Depends(get_supabase)
):
    """Get recent metrics for a project"""
    try:
        result = supabase.table("metrics") \
            .select("*") \
            .eq("project_id", project_id) \
            .order("timestamp", desc=True) \
            .limit(limit) \
            .execute()
        
        return {
            "project_id": project_id,
            "count": len(result.data) if result.data else 0,
            "metrics": result.data if result.data else []
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/metrics/{project_id}/latest")
async def get_latest_metrics(project_id: str, supabase: Client = Depends(get_supabase)):
    """Get the latest metrics for a project"""
    try:
        result = supabase.table("metrics") \
            .select("*") \
            .eq("project_id", project_id) \
            .order("timestamp", desc=True) \
            .limit(1) \
            .execute()
        
        if result.data and len(result.data) > 0:
            return result.data[0]
        else:
            raise HTTPException(status_code=404, detail="No metrics found for this project")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
