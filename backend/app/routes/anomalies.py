from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel
from typing import Literal, Optional
from uuid import uuid4
from datetime import datetime
from app.database import get_supabase
from supabase import Client

router = APIRouter()

class AnomalyCreate(BaseModel):
    project_id: str
    type: str
    severity: Literal["low", "medium", "high", "critical"]
    description: str
    metric_snapshot: Optional[dict] = None

class AnomalyUpdate(BaseModel):
    resolved: bool

@router.post("/anomalies")
async def create_anomaly(anomaly: AnomalyCreate, supabase: Client = Depends(get_supabase)):
    """Record a detected anomaly"""
    try:
        result = supabase.table("anomalies").insert({
            "id": str(uuid4()),
            "project_id": anomaly.project_id,
            "type": anomaly.type,
            "severity": anomaly.severity,
            "description": anomaly.description,
            "metric_snapshot": anomaly.metric_snapshot,
            "resolved": False,
        }).execute()
        
        if result.data:
            # Optionally trigger Slack alert
            # await send_slack_alert(result.data[0])
            return result.data[0]
        else:
            raise HTTPException(status_code=500, detail="Failed to create anomaly")
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error creating anomaly: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/anomalies/{project_id}")
async def get_anomalies(
    project_id: str,
    limit: int = Query(50, ge=1, le=1000),
    resolved: Optional[bool] = None,
    supabase: Client = Depends(get_supabase)
):
    """Get anomalies for a project"""
    try:
        query = supabase.table("anomalies") \
            .select("*") \
            .eq("project_id", project_id)
        
        if resolved is not None:
            query = query.eq("resolved", resolved)
        
        result = query \
            .order("detected_at", desc=True) \
            .limit(limit) \
            .execute()
        
        return {
            "project_id": project_id,
            "count": len(result.data) if result.data else 0,
            "anomalies": result.data if result.data else []
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/anomalies/{project_id}/active")
async def get_active_anomalies(project_id: str, supabase: Client = Depends(get_supabase)):
    """Get only unresolved anomalies"""
    try:
        result = supabase.table("anomalies") \
            .select("*") \
            .eq("project_id", project_id) \
            .eq("resolved", False) \
            .order("detected_at", desc=True) \
            .execute()
        
        return {
            "project_id": project_id,
            "active_count": len(result.data) if result.data else 0,
            "anomalies": result.data if result.data else []
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/anomalies/detail/{anomaly_id}")
async def get_anomaly(anomaly_id: str, supabase: Client = Depends(get_supabase)):
    """Get detailed anomaly information"""
    try:
        result = supabase.table("anomalies") \
            .select("*") \
            .eq("id", anomaly_id) \
            .execute()
        
        if result.data and len(result.data) > 0:
            return result.data[0]
        else:
            raise HTTPException(status_code=404, detail="Anomaly not found")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/anomalies/{anomaly_id}")
async def update_anomaly(
    anomaly_id: str,
    update: AnomalyUpdate,
    supabase: Client = Depends(get_supabase)
):
    """Update anomaly status (mark as resolved)"""
    try:
        update_data = {
            "resolved": update.resolved,
        }
        if update.resolved:
            update_data["resolved_at"] = datetime.utcnow().isoformat()
        
        result = supabase.table("anomalies") \
            .update(update_data) \
            .eq("id", anomaly_id) \
            .execute()
        
        if result.data and len(result.data) > 0:
            return result.data[0]
        else:
            raise HTTPException(status_code=404, detail="Anomaly not found")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/anomalies/{anomaly_id}")
async def delete_anomaly(anomaly_id: str, supabase: Client = Depends(get_supabase)):
    """Delete an anomaly record"""
    try:
        supabase.table("anomalies").delete().eq("id", anomaly_id).execute()
        return {"message": "Anomaly deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
