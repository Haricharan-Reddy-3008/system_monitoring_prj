import sys
import os

sys.path.append(os.path.join(os.getcwd(), 'backend'))

from dotenv import load_dotenv
load_dotenv(os.path.join(os.getcwd(), 'backend', '.env'))

from app.database import get_supabase

def check_db():
    try:
        supabase = get_supabase()
        # Try fetching from projects table
        print("Checking 'projects' table...")
        result = supabase.table("projects").select("id").limit(1).execute()
        print("Projects table exists.", result.data)
        
        print("Checking 'metrics' table...")
        result = supabase.table("metrics").select("id").limit(1).execute()
        print("Metrics table exists.", result.data)

        print("Checking 'logs' table...")
        result = supabase.table("logs").select("id").limit(1).execute()
        print("Logs table exists.", result.data)
        
        print("Checking 'anomalies' table...")
        result = supabase.table("anomalies").select("id").limit(1).execute()
        print("Anomalies table exists.", result.data)

        print("All tables seem to exist.")
    except Exception as e:
        print(f"Error checking db: {e}")

if __name__ == "__main__":
    check_db()
