import sys
import os

sys.path.append(os.path.join(os.getcwd(), 'backend'))

from dotenv import load_dotenv
load_dotenv(os.path.join(os.getcwd(), 'backend', '.env'))

from app.database import get_supabase

def audit_db():
    try:
        supabase = get_supabase()
        
        # 1. Check Projects
        print("--- Projects ---")
        projects = supabase.table("projects").select("*").execute()
        print(f"Total projects: {len(projects.data)}")
        for p in projects.data:
            print(f"ID: {p['id']}, Name: {p['name']}, User: {p['user_id']}")
            
        # 2. Check Metrics
        print("\n--- Metrics ---")
        metrics = supabase.table("metrics").select("id").limit(5).execute()
        print(f"Total metrics (sampled): {len(metrics.data)}")

        # 3. Check Users (using service role key)
        print("\n--- Auth Users ---")
        try:
            users_resp = supabase.auth.admin.list_users()
            users = users_resp if isinstance(users_resp, list) else getattr(users_resp, 'users', [])
            print(f"Total auth users: {len(users)}")
            for u in users:
                print(f"ID: {u.id}, Email: {u.email}")
        except Exception as e:
            print(f"Could not list users: {e}")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    audit_db()
