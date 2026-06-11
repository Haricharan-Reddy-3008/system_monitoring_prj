import sys
import os

sys.path.append(os.path.join(os.getcwd(), 'backend'))

from dotenv import load_dotenv
load_dotenv(os.path.join(os.getcwd(), 'backend', '.env'))

from app.database import get_supabase
from uuid import uuid4

def test_auth_and_create():
    try:
        supabase = get_supabase()
        
        users_resp = supabase.auth.admin.list_users()
        users = users_resp if isinstance(users_resp, list) else getattr(users_resp, 'users', [])
        if not users:
            print("No users found.")
            return
            
        valid_user_id = users[0].id
        print(f"Found user ID: {valid_user_id}")
        
        project_id = str(uuid4())
        print(f"Attempting to create project with ID: {project_id}")
        
        # Test insert
        result = supabase.table("projects").insert({
            "id": project_id,
            "name": "Diagnostic Project",
            "user_id": valid_user_id,
        }).execute()
        
        print("Insert Success!")
        print(f"Result Data: {result.data}")
        if result.data and len(result.data) > 0:
            print("Data returned correctly!")
        else:
            print("WARNING: Data is empty! This causes the 500 error in projects.py")
        
    except Exception as e:
        print(f"Error during execution: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_auth_and_create()
