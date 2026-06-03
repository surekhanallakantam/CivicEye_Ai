import os
import sys

# Ensure backend/fastapi is in the path
base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
backend_dir = os.path.join(base_dir, "backend", "fastapi")
sys.path.insert(0, backend_dir)

from dotenv import load_dotenv
load_dotenv(os.path.join(backend_dir, ".env"))

from app.core.supabase_client import get_supabase_client

DEPARTMENTS = [
    # Geographic
    {"name": "Roads Department", "slug": "roads", "is_geographic": True},
    {"name": "Drainage Department", "slug": "drainage", "is_geographic": True},
    {"name": "Sanitation Department", "slug": "garbage", "is_geographic": True},
    {"name": "Water Department", "slug": "water", "is_geographic": True},
    {"name": "Electrical Department", "slug": "electricity", "is_geographic": True},
    # Non-Geographic
    {"name": "Pension Department", "slug": "pension", "is_geographic": False},
    {"name": "Agriculture Department", "slug": "agriculture", "is_geographic": False},
    {"name": "Revenue Department", "slug": "revenue", "is_geographic": False},
    {"name": "Education Department", "slug": "scholarship", "is_geographic": False},
    {"name": "Insurance Department", "slug": "insurance", "is_geographic": False},
]

CATEGORIES = [
    # Geographic
    {"name": "Road Safety", "slug": "road-safety", "default_dept_slug": "roads", "is_geographic": True},
    {"name": "Pothole", "slug": "pothole", "default_dept_slug": "roads", "is_geographic": True},
    {"name": "Garbage Accumulation", "slug": "garbage-accumulation", "default_dept_slug": "garbage", "is_geographic": True},
    {"name": "Drainage Leakage", "slug": "drainage-leakage", "default_dept_slug": "drainage", "is_geographic": True},
    {"name": "Broken Streetlight", "slug": "broken-streetlight", "default_dept_slug": "electricity", "is_geographic": True},
    {"name": "Water Leakage", "slug": "water-leakage", "default_dept_slug": "water", "is_geographic": True},
    # Non-Geographic
    {"name": "Pension Delay", "slug": "pension-delay", "default_dept_slug": "pension", "is_geographic": False},
    {"name": "Farmer Subsidy Issues", "slug": "farmer-subsidy", "default_dept_slug": "agriculture", "is_geographic": False},
    {"name": "Scholarship Delay", "slug": "scholarship-delay", "default_dept_slug": "scholarship", "is_geographic": False},
    {"name": "Insurance Claims", "slug": "insurance-claims", "default_dept_slug": "insurance", "is_geographic": False},
    {"name": "Revenue Delay", "slug": "revenue-delay", "default_dept_slug": "revenue", "is_geographic": False},
]

def seed():
    try:
        sb = get_supabase_client()
    except Exception as e:
        print(f"Failed to initialize Supabase client: {e}")
        return

    print("Seeding departments...")
    dept_map = {}
    for d in DEPARTMENTS:
        # Check if already exists
        existing = sb.table("departments").select("id").eq("slug", d["slug"]).execute()
        if existing.data:
            print(f"Department '{d['name']}' already exists.")
            dept_map[d["slug"]] = existing.data[0]["id"]
        else:
            try:
                res = sb.table("departments").insert({
                    "name": d["name"],
                    "slug": d["slug"],
                    "is_geographic": d["is_geographic"],
                    "is_active": True
                }).execute()
                if res.data:
                    print(f"Created department: {d['name']}")
                    dept_map[d["slug"]] = res.data[0]["id"]
            except Exception as e:
                print(f"Error seeding department {d['name']}: {e}")

    print("\nSeeding categories...")
    for c in CATEGORIES:
        existing = sb.table("categories").select("id").eq("slug", c["slug"]).execute()
        if existing.data:
            print(f"Category '{c['name']}' already exists.")
        else:
            dept_id = dept_map.get(c["default_dept_slug"])
            if not dept_id:
                print(f"Skipping '{c['name']}' - default department '{c['default_dept_slug']}' not found.")
                continue
            try:
                res = sb.table("categories").insert({
                    "name": c["name"],
                    "slug": c["slug"],
                    "default_department_id": dept_id,
                    "is_geographic": c["is_geographic"]
                }).execute()
                if res.data:
                    print(f"Created category: {c['name']}")
            except Exception as e:
                print(f"Error seeding category {c['name']}: {e}")

if __name__ == "__main__":
    seed()
