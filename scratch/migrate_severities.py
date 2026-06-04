import os
import sys

backend_dir = r"c:\Users\VAMSI KRISHNA\Desktop\PROJECTS\CivicEye\CivicEye\backend\fastapi"
sys.path.insert(0, backend_dir)

from dotenv import load_dotenv
load_dotenv(os.path.join(backend_dir, ".env"))

from app.core.supabase_client import get_supabase_client

def migrate_severities():
    sb = get_supabase_client()
    
    print("Fetching complaints...")
    res = sb.table("complaints").select("id, complaint_code, severity").execute()
    complaints = res.data if res.data else []
    print(f"Found {len(complaints)} complaints.")
    
    updated_count = 0
    for row in complaints:
        comp_id = row["id"]
        code = row["complaint_code"]
        
        # Check if severity is None
        if not row.get("severity"):
            # Fetch from AI analysis
            ai_res = sb.table("complaint_ai_analysis").select("severity").eq("complaint_id", comp_id).execute()
            if ai_res.data and ai_res.data[0].get("severity"):
                severity = ai_res.data[0]["severity"]
                print(f"Updating complaint {code} with severity: {severity}")
                sb.table("complaints").update({"severity": severity}).eq("id", comp_id).execute()
                updated_count += 1
            else:
                # If no AI analysis, use fallback default severity
                print(f"No AI analysis for {code}. Defaulting to 'medium'.")
                sb.table("complaints").update({"severity": "medium"}).eq("id", comp_id).execute()
                updated_count += 1
                
    print(f"Migration completed. Updated {updated_count} complaints.")

if __name__ == "__main__":
    migrate_severities()
