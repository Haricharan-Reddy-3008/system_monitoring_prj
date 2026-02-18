from fastapi import APIRouter

router = APIRouter()

@router.get("/explanations/{project_id}")
async def get_explanations(project_id: str):
    """Get AI explanations for a project"""
    return {"message": f"Explanations for project {project_id}"}
