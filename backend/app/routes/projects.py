from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from uuid import uuid4
from app.database import get_supabase
from supabase import Client

router = APIRouter()

class ProjectCreate(BaseModel):
    name: str
    user_id: str

class ProjectResponse(BaseModel):
    id: str
    name: str
    user_id: str
    created_at: str
    updated_at: str

@router.post("/projects", response_model=ProjectResponse)
async def create_project(project: ProjectCreate, supabase: Client = Depends(get_supabase)):
    """Create a new monitoring project"""
    try:
        # Validate user_id is not empty
        if not project.user_id or not project.user_id.strip():
            raise HTTPException(status_code=400, detail="user_id is required")
        
        if not project.name or not project.name.strip():
            raise HTTPException(status_code=400, detail="Project name is required")
        
        project_id = str(uuid4())
        
        # Insert into Supabase
        result = supabase.table("projects").insert({
            "id": project_id,
            "name": project.name.strip(),
            "user_id": project.user_id,
        }).execute()
        
        if result.data and len(result.data) > 0:
            return result.data[0]
        else:
            raise HTTPException(status_code=500, detail="Failed to create project in database")
            
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error creating project: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/projects")
async def list_projects(user_id: str = None, supabase: Client = Depends(get_supabase)):
    """Get all projects for a user"""
    try:
        if user_id:
            result = supabase.table("projects").select("*").eq("user_id", user_id).execute()
        else:
            result = supabase.table("projects").select("*").execute()
        
        return {"projects": result.data if result.data else []}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/projects/{project_id}", response_model=ProjectResponse)
async def get_project(project_id: str, supabase: Client = Depends(get_supabase)):
    """Get a specific project"""
    try:
        result = supabase.table("projects").select("*").eq("id", project_id).execute()
        
        if result.data and len(result.data) > 0:
            return result.data[0]
        else:
            raise HTTPException(status_code=404, detail="Project not found")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/projects/{project_id}")
async def update_project(project_id: str, name: str, supabase: Client = Depends(get_supabase)):
    """Update a project"""
    try:
        if not name or not name.strip():
            raise HTTPException(status_code=400, detail="Project name is required")
        
        result = supabase.table("projects").update({
            "name": name.strip()
        }).eq("id", project_id).execute()
        
        if result.data and len(result.data) > 0:
            return result.data[0]
        else:
            raise HTTPException(status_code=404, detail="Project not found")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/projects/{project_id}")
async def delete_project(project_id: str, supabase: Client = Depends(get_supabase)):
    """Delete a project"""
    try:
        result = supabase.table("projects").delete().eq("id", project_id).execute()
        return {"message": "Project deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
