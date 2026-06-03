# Database Setup

This folder holds the Supabase PostgreSQL schema for CivicEye AI.

## Files

- `schema.sql` - main database schema for complaints, departments, categories, clusters, and AI insights.

## How to use

1. Open the Supabase SQL editor.
2. Paste and run `db/schema.sql`.
3. Confirm the tables and enum types were created.

## Where to change Supabase credentials

Update the values in `backend/fastapi/.env` after copying from `backend/fastapi/.env.example`.
