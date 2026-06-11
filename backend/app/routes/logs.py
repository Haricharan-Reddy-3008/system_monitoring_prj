from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel
from datetime import datetime
from typing import Literal
from app.database import get_supabase
from supabase import Client

router = APIRouter()

class LogIngest(BaseModel):
    project_id: str
    timestamp: datetime
    level: Literal["INFO", "WARN", "ERROR"]
    message: str
    source: str = "unknown"

@router.post("/logs")
async def ingest_logs(log: LogIngest, supabase: Client = Depends(get_supabase)):
    """Ingest log data"""
    try:
        result = supabase.table("logs").insert({
            "project_id": log.project_id,
            "timestamp": log.timestamp.isoformat(),
            "level": log.level,
            "message": log.message,
            "source": log.source,
        }).execute()
        
        return {"success": True, "data": result.data}
    except Exception as e:
        print(f"Error ingesting logs: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/logs/{project_id}")
async def get_logs(
    project_id: str,
    level: str = Query(None),
    limit: int = Query(100, ge=1, le=1000),
    supabase: Client = Depends(get_supabase)
):
    """Get logs for a project with optional filtering"""
    try:
        query = supabase.table("logs").select("*").eq("project_id", project_id)
        
        if level:
            query = query.eq("level", level.upper())
        
        result = query \
            .order("timestamp", desc=True) \
            .limit(limit) \
            .execute()
        
        return {
            "project_id": project_id,
            "count": len(result.data) if result.data else 0,
            "logs": result.data if result.data else []
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/logs/{project_id}/patterns")
async def get_log_patterns(project_id: str, supabase: Client = Depends(get_supabase)):
    """Get detected log patterns for a project"""
    try:
        result = supabase.table("log_patterns") \
            .select("*") \
            .eq("project_id", project_id) \
            .order("occurrence_count", desc=True) \
            .execute()
        
        return {
            "project_id": project_id,
            "patterns": result.data if result.data else []
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/logs/{project_id}/errors")
async def get_error_logs(
    project_id: str,
    limit: int = Query(50, ge=1, le=1000),
    supabase: Client = Depends(get_supabase)
):
    """Get error logs only"""
    try:
        result = supabase.table("logs") \
            .select("*") \
            .eq("project_id", project_id) \
            .eq("level", "ERROR") \
            .order("timestamp", desc=True) \
            .limit(limit) \
            .execute()
        
        return {
            "project_id": project_id,
            "error_count": len(result.data) if result.data else 0,
            "errors": result.data if result.data else []
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
