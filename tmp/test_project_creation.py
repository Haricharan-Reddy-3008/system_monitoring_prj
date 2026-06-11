import sys
import os

# Add the backend directory to sys.path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from dotenv import load_dotenv
load_dotenv(os.path.join(os.getcwd(), 'backend', '.env'))

from app.database import get_supabase
from uuid import uuid4

def test_create_project():
    supabase = get_supabase()
    project_id = str(uuid4())
    dummy_user_id = str(uuid4()) # In reality, this would be a real user ID from auth.users
    
    print(f"Attempting to create project with ID: {project_id}")
    try:
        result = supabase.table("projects").insert({
            "id": project_id,
            "name": "Test Project",
            "user_id": dummy_user_id,
        }).execute()
        print("Success!")
        print(result.data)
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_create_project()
