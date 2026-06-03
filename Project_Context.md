# CivicEye AI - Project Context

## Project Overview

CivicEye AI is an AI-powered citizen grievance management platform that connects citizens and government departments.

The platform has two major sides:

### Citizen Side

Citizens can report public issues by submitting:

* Name
* Phone Number
* Problem Description
* State
* City
* Address
* Pincode
* Image (Optional)

Example complaint:

> There is an open manhole near ABC School.

The goal is to make reporting civic issues simple and accessible.

---

### Government/Admin Side

Government departments receive AI-processed complaints and use dashboards, clustering, analytics, heatmaps, and insights to prioritize action.

The system reduces complaint overload by grouping similar complaints into clusters and generating actionable intelligence.

---

# Technology Stack

## Frontend

* React
* TypeScript
* Tailwind CSS
* Shadcn UI

## Backend

* FastAPI (Python)

## Database

* Supabase PostgreSQL

## AI

### Gemini / Hugging Face

Used only during complaint ingestion for:

* Category Detection
* Department Detection
* Severity Classification
* Official Complaint Generation
* Optional Image Understanding

### Embedding Model

Used for:

* Complaint Similarity
* Cluster Assignment
* Semantic Search

Examples:

* Gemini Embeddings
* OpenAI Embeddings
* Sentence Transformers

---

# Core Workflow

## Step 1: Complaint Submission

Citizen submits:

```json
{
  "name": "John Doe",
  "phone": "9876543210",
  "description": "Open manhole near ABC School",
  "state": "Andhra Pradesh",
  "city": "Visakhapatnam",
  "address": "Beach Road",
  "pincode": "530001",
  "image": "optional"
}
```

Status:

```text
Submitted
```

---

## Step 2: AI Processing

FastAPI sends complaint data to Gemini.

Input:

```json
{
  "description": "...",
  "location": "...",
  "image": "..."
}
```

Gemini performs:

### Category Detection

Example:

```json
{
  "category": "Road Safety"
}
```

### Department Routing

Example:

```json
{
  "department": "Roads Department"
}
```

### Severity Detection

Example:

```json
{
  "severity": "Critical"
}
```

### Official Complaint Generation

Citizen Input:

```text
manhole open near school
```

AI Output:

```text
An open manhole has been observed near ABC School, creating a significant safety hazard for pedestrians and students. Immediate corrective action is requested.
```

Store:

* Original Complaint
* AI Generated Complaint

---

## Step 3: Image Understanding

If image is uploaded:

Gemini Vision identifies issues such as:

* Open Manhole
* Pothole
* Garbage Dump
* Drainage Leakage
* Broken Streetlight
* Water Leakage
* Road Damage

Image results become part of complaint metadata.

---

## Step 4: Complaint Record Creation

Generate unique complaint ID.

Example:

```text
CIV-2026-0001
```

Store in Supabase.

Initial status:

```text
Submitted
```

---

# Database Entities

## Complaints

Stores:

* Complaint ID
* Citizen Information
* Original Complaint
* Generated Complaint
* Category
* Department
* Severity
* Status
* Embedding Vector
* Latitude
* Longitude
* Created At

---

## Clusters

Stores:

* Cluster ID
* Cluster Title
* Department
* Category
* Priority
* Complaint Count
* Citizen Count
* AI Insight
* Latitude
* Longitude
* Created At

---

## Complaint-Cluster Mapping

Stores relationship between:

* Complaint
* Cluster

One cluster can contain many complaints.

---

# Department Routing

The system automatically routes complaints.

Examples:

| Category          | Department            |
| ----------------- | --------------------- |
| Road Safety       | Roads Department      |
| Garbage           | Sanitation Department |
| Drainage          | Drainage Department   |
| Water Leakage     | Water Department      |
| Streetlight       | Electrical Department |
| Pension Delay     | Pension Department    |
| Scholarship Issue | Education Department  |

Departments only see complaints relevant to them.

---

# Admin Dashboard

Raw incoming complaints appear immediately.

Columns:

| ID | Complaint | Department | Severity | Status |
| -- | --------- | ---------- | -------- | ------ |

No clustering is performed initially.

Admin can filter by:

* State
* City
* Department
* Severity
* Status
* Date Range

---

# Clustering Architecture

## Important Design Decision

### Do NOT use LLMs for clustering.

LLMs are expensive and do not scale.

Running Gemini to compare every complaint with every other complaint becomes infeasible at:

* 10,000 complaints
* 100,000 complaints
* 1,000,000+ complaints

Instead use embeddings and machine learning.

---

# Hybrid AI Architecture

## Use Gemini Once

When complaint arrives:

```text
Complaint
    ↓
Gemini
    ↓
Category
Department
Severity
Generated Complaint
```

Store results permanently.

No repeated Gemini calls for clustering.

---

## Use Embeddings for Clustering

Convert complaint text into vector representation.

Example:

Complaint:

```text
Open manhole near ABC School
```

Embedding:

```text
[0.23, 0.81, 0.45, ...]
```

Complaint:

```text
Manhole uncovered beside ABC School
```

Embedding:

```text
[0.25, 0.79, 0.48, ...]
```

Vectors are semantically close.

---

# Recommended Clustering Strategy

## MVP

Use:

### Embeddings + Cosine Similarity

Workflow:

```text
Complaint
    ↓
Embedding Model
    ↓
Vector
    ↓
Similarity Search
    ↓
Assign Existing Cluster
or
Create New Cluster
```

Advantages:

* Fast
* Easy to implement
* Highly scalable

---

## Production Upgrade

Use:

### HDBSCAN

Benefits:

* Automatically discovers clusters
* No need to specify cluster count
* Handles noise
* Handles outliers

Example:

```text
1000 Complaints
      ↓
HDBSCAN
      ↓
84 Clusters
130 Noise Complaints
```

---

# Cluster Creation

Example complaints:

```text
Open manhole near ABC School
```

```text
Manhole uncovered near school
```

```text
Dangerous open manhole beside ABC School
```

System determines:

```text
Same Incident
```

Creates:

```text
Cluster #101
```

Data:

```json
{
  "title": "Open Manhole Near ABC School",
  "complaint_count": 27,
  "affected_citizens": 27,
  "department": "Roads Department",
  "priority": "Critical"
}
```

---

# AI Cluster Intelligence

After cluster formation:

Gemini may be used occasionally to generate cluster-level summaries.

Example:

```text
High road safety risk detected near ABC School.

27 citizens reported the same issue.

Immediate inspection is recommended.
```

Store as:

```text
AI Insight
```

Important:

Gemini should summarize clusters, not perform clustering.

---

# Geographic Processing

For location-based departments:

* Roads
* Drainage
* Water
* Garbage
* Streetlights

Perform geocoding.

Input:

* Address
* City
* State
* Pincode

Output:

```json
{
  "latitude": 17.7231,
  "longitude": 83.3012
}
```

Store coordinates.

---

# Heatmap System

Heatmaps must be generated from CLUSTERS, not raw complaints.

Incorrect:

```text
Complaint Count
```

Correct:

```text
Cluster Count
```

Example:

| Cluster | Complaints |
| ------- | ---------- |
| A       | 35         |
| B       | 12         |
| C       | 5          |

Heatmap intensity:

```text
35 → Red
12 → Yellow
5 → Green
```

Purpose:

Identify complaint hotspots.

---

# Geographic Insights

Examples:

```text
Beach Road → 42 complaints
```

```text
MVP Colony → 28 complaints
```

```text
Gajuwaka → 17 complaints
```

Administrators can identify where resources should be allocated.

---

# Non-Geographic Departments

Examples:

* Pension
* Revenue
* Scholarship
* Insurance
* Agriculture

Heatmaps are not useful.

Instead provide:

* District-wise Analysis
* Trend Charts
* Cluster Analysis
* Resolution Statistics
* Monthly Reports

Example:

```text
Pension complaints increased 18% in District X.
```

---

# Executive Dashboard

Key metrics:

### Complaint Metrics

* Total Complaints
* New Complaints
* Pending Complaints
* Resolved Complaints

### Cluster Metrics

* Total Clusters
* Active Clusters
* Critical Clusters

### Performance Metrics

* Complaint Reduction %
* Resolution Rate
* Average Resolution Time

### Department Metrics

* Department Performance
* Critical Issues Pending

---

# Transparency Layer

Citizens can track complaint progress.

Workflow:

```text
Submitted
    ↓
Assigned
    ↓
Under Review
    ↓
In Progress
    ↓
Resolved
```

Citizen sees:

* Current Status
* Responsible Department
* Resolution Timeline

---

# Accountability Layer

Track department performance.

Metrics:

* Resolution Rate
* Average Resolution Time
* Pending Cases
* Critical Cases Pending
* Department Rankings

Example:

```text
Roads Department

Resolution Rate: 91%
Average Resolution Time: 3 Days
```

---

# End-to-End System Flow

```text
Citizen
    ↓
Submit Complaint
(Text + Image + Location)
    ↓
Gemini
    ↓
Category Detection
Department Routing
Severity Detection
Complaint Generation
    ↓
Embedding Generation
    ↓
Supabase Storage
    ↓
Raw Complaints Dashboard
    ↓
Admin Filtering
    ↓
Similarity Search / Clustering
    ↓
Complaint Clusters
    ↓
AI Cluster Insights
    ↓
Heatmaps
or
Trend Analytics
    ↓
Executive Dashboard
    ↓
Department Action
    ↓
Status Updates
    ↓
Citizen Tracking
```

---

# Key Architectural Principles

1. Use Gemini only once during complaint ingestion.
2. Use embeddings for clustering.
3. Never use LLM-to-LLM complaint comparisons.
4. Heatmaps are based on clusters, not raw complaints.
5. Clusters reduce complaint noise.
6. Departments only see relevant complaints.
7. Citizens must have transparent status tracking.
8. System should scale to millions of complaints.
9. AI should assist decision-making, not replace administrators.
10. Every complaint must remain traceable even after clustering.

```
```