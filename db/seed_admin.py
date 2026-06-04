import os
import sys

# Ensure backend/fastapi is in the path
base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
backend_dir = os.path.join(base_dir, "backend", "fastapi")
sys.path.insert(0, backend_dir)

from dotenv import load_dotenv
load_dotenv(os.path.join(backend_dir, ".env"))

from app.core.supabase_client import get_supabase_client
from app.core.security import hash_password

def seed_admin():
    email = "surekhanallakantham@gmail.com"
    password = "surekha@123"
    name = "Surekha Nallakantham"
    
    try:
        sb = get_supabase_client()
    except Exception as e:
        print(f"Failed to initialize Supabase client: {e}")
        return

    print("Hashing password...")
    hashed = hash_password(password)
    
    print(f"Checking if admin '{email}' already exists...")
    try:
        existing = sb.table("citizens").select("id").eq("email", email).execute()
        if existing.data:
            print("Admin user already exists. Updating credentials and role...")
            res = sb.table("citizens").update({
                "password_hash": hashed,
                "name": name,
                "role": "admin"
            }).eq("email", email).execute()
            if res.data:
                print("Admin user updated successfully.")
            else:
                print("Update executed but returned no data.")
        else:
            print("Creating new admin user...")
            res = sb.table("citizens").insert({
                "email": email,
                "password_hash": hashed,
                "name": name,
                "role": "admin"
            }).execute()
            if res.data:
                print("Admin user created successfully.")
            else:
                print("Insert executed but returned no data.")
    except Exception as e:
        print(f"Error seeding admin user: {e}")
        print("\nNote: Please make sure you have executed the following SQL in your Supabase SQL editor:")
        print("ALTER TABLE public.citizens ADD COLUMN IF NOT EXISTS role text DEFAULT 'citizen';")

if __name__ == "__main__":
    seed_admin()
