create extension if not exists pgcrypto;

create table if not exists departments (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  is_geographic boolean not null default true,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  default_department_id uuid references departments(id) on delete set null,
  is_geographic boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$ begin
  create type complaint_status as enum (
    'submitted',
    'ai_categorized',
    'assigned',
    'under_review',
    'in_progress',
    'resolved',
    'feedback_received',
    'rejected',
    'escalated'
  );
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type complaint_severity as enum ('critical', 'high', 'medium', 'low');
exception
  when duplicate_object then null;
end $$;

create table if not exists complaints (
  id uuid primary key default gen_random_uuid(),
  complaint_code text not null unique,
  citizen_name text not null,
  phone_number text,
  description text not null,
  generated_complaint text,
  state text not null,
  city text not null,
  address text not null,
  pincode text not null,
  latitude numeric(9,6),
  longitude numeric(9,6),
  location_type text,
  image_url text,
  source_type text not null default 'citizen',
  status complaint_status not null default 'submitted',
  severity complaint_severity,
  category_id uuid references categories(id) on delete set null,
  department_id uuid references departments(id) on delete set null,
  ai_confidence integer,
  submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists complaint_attachments (
  id uuid primary key default gen_random_uuid(),
  complaint_id uuid not null references complaints(id) on delete cascade,
  file_url text not null,
  file_type text,
  created_at timestamptz not null default now()
);

create table if not exists complaint_status_history (
  id uuid primary key default gen_random_uuid(),
  complaint_id uuid not null references complaints(id) on delete cascade,
  old_status complaint_status,
  new_status complaint_status not null,
  changed_by text,
  note text,
  changed_at timestamptz not null default now()
);

create table if not exists complaint_ai_analysis (
  id uuid primary key default gen_random_uuid(),
  complaint_id uuid not null references complaints(id) on delete cascade,
  raw_input jsonb,
  ai_summary text,
  category text,
  department_name text,
  severity complaint_severity,
  root_cause text,
  sentiment text,
  confidence_score integer,
  model_version text,
  created_at timestamptz not null default now()
);

create table if not exists clusters (
  id uuid primary key default gen_random_uuid(),
  cluster_code text not null unique,
  cluster_name text not null,
  cluster_type text,
  department_id uuid references departments(id) on delete set null,
  category_id uuid references categories(id) on delete set null,
  city text,
  state text,
  is_geographic boolean not null default true,
  affected_citizens integer not null default 0,
  first_reported_at timestamptz,
  latest_reported_at timestamptz,
  district_impact text,
  confidence_score integer,
  priority text,
  status text not null default 'open',
  ai_summary text,
  root_cause_insight text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists cluster_complaints (
  id uuid primary key default gen_random_uuid(),
  cluster_id uuid not null references clusters(id) on delete cascade,
  complaint_id uuid not null references complaints(id) on delete cascade,
  similarity_score numeric(5,2),
  added_at timestamptz not null default now(),
  unique (cluster_id, complaint_id)
);

create table if not exists ai_insights (
  id uuid primary key default gen_random_uuid(),
  scope_type text not null,
  scope_id uuid,
  insight_type text not null,
  title text not null,
  description text not null,
  severity_level text,
  created_at timestamptz not null default now()
);
