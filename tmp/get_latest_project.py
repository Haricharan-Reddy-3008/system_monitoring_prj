import sys
import os

sys.path.append(os.path.join(os.getcwd(), 'backend'))

from dotenv import load_dotenv
load_dotenv(os.path.join(os.getcwd(), 'backend', '.env'))

from app.database import get_supabase

def get_latest_project():
    try:
        supabase = get_supabase()
        result = supabase.table("projects").select("id, name").order("created_at", desc=True).limit(1).execute()
        if result.data and len(result.data) > 0:
            print(result.data[0]['id'])
        else:
            print("No proj")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    get_latest_project()
