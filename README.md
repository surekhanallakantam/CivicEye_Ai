# CivicEye AI

Intelligent Civic Complaint Intelligence Platform

## Overview

CivicEye AI is an AI-powered civic complaint management and governance intelligence platform.

It helps citizens report civic and public-service issues through text or image submissions and helps government departments automatically analyze, organize, prioritize, and monitor complaints.

Unlike traditional grievance portals, this system focuses on:

- AI-powered complaint understanding
- Automatic categorization
- Department routing
- Complaint clustering
- Transparency
- Accountability
- Heatmaps and analytics
- Governance intelligence

## Design Principles

- Keep raw complaints, AI outputs, and clustered intelligence as separate layers.
- Make every AI decision explainable with a confidence score.
- Treat geographic and non-geographic complaints differently in analytics.
- Make the citizen experience simple, but keep the admin side data-rich.

## Tech Stack

### Frontend

- React
- Tailwind CSS
- React Router
- Recharts
- React Leaflet

### Backend

- FastAPI
- Python

### Database

- Supabase PostgreSQL

### AI

- Gemini API

### Maps

- Leaflet
- OpenStreetMap

### Charts

- Recharts

## User Roles

### 1. Citizen

Can:

- Submit complaint
- Upload image (optional)
- Enter complaint text
- Enter phone number
- Enter state
- Enter city
- Enter address
- Enter pincode
- Track complaint status

### 2. Government Admin

Can:

- View complaints
- Filter complaints
- Run clustering
- View clustered incidents
- View analytics
- View heatmaps
- Manage departments
- Update complaint status

## Core Workflow

### Citizen Side

Citizen enters:

- Name
- Phone Number
- Problem Description
- State
- City
- Address
- Pincode
- Image (optional)

Submit

↓

Gemini analyzes complaint

↓

Generate:

```json
{
  "category": "Road Safety",
  "department": "Roads Department",
  "severity": "High",
  "confidence": 94,
  "generated_complaint": "...",
  "location_type": "Geographic"
}
```

↓

Store in Supabase

↓

Generate Complaint ID

↓

Citizen can track status

### Complaint Lifecycle

Submitted

↓

AI Categorized

↓

Assigned to Department

↓

Under Review

↓

In Progress

↓

Resolved

↓

Citizen Feedback

This lifecycle keeps transparency and accountability visible at every step.

### Severity Levels

Severity should be standardized so AI decisions are easier to explain:

- Critical
  - Open manhole
  - Fallen electric wire
- High
  - Large potholes
  - Major water leakage
- Medium
  - Garbage accumulation
- Low
  - General maintenance requests

### Department Routing Rules

```python
GEOGRAPHIC_DEPARTMENTS = [
    "Roads",
    "Drainage",
    "Garbage",
    "Water",
    "Electricity",
]

NON_GEOGRAPHIC_DEPARTMENTS = [
    "Pension",
    "Agriculture",
    "Revenue",
    "Scholarship",
    "Insurance",
]
```

Use geographic departments for heatmaps and non-geographic departments for trend charts.

### Government Side Workflow

#### Phase 1: Raw Complaints

Admin sees all complaints.

Filters:

- State
- City
- Department
- Severity
- Date Range
- Status

#### Phase 2: Clustering Engine

Admin clicks:

- Run Clustering

System groups similar complaints.

Example:

- Open manhole near ABC School
- Manhole uncovered near ABC School
- Dangerous open drainage near ABC School

Become

Cluster:

- Open Manhole Near ABC School

Affected Citizens:

- 27

First Reported:

- Date

Latest Reported:

- Date

District Impact:

- High

Confidence:

- 94%

#### Phase 3: Cluster Intelligence

Each cluster contains:

- Cluster Name
- Affected Citizens
- First Reported
- Latest Reported
- District Impact
- Priority
- Department
- Status
- AI Summary
- Root Cause Insights

#### Phase 4: Analytics

Show:

- Total Complaints
- Total Clusters
- Complaints Reduced %
- Department Performance
- Resolution Rate
- Transparency Metrics
- Accountability Metrics
- Geographic Complaints
- AI Confidence Scores

Examples:

- Roads
- Garbage
- Drainage
- Water Leakage
- Streetlights

These have locations.

Show:

- Heatmap
- Incident Markers
- Cluster Density

Use clustered data instead of raw complaints.

### Executive Insight Card

The Executive Dashboard should include a high-level AI summary card such as:

This week:

- Drainage complaints increased 23%
- Beach Road remains highest risk area
- Pension delays reduced 12%

This gives leadership a fast read on system health and emerging risks.

### Non-Geographic Complaints

Examples:

- Pension Issues
- Farmer Subsidies
- Insurance Claims
- Scholarship Delays
- Revenue Department Issues

Heatmaps are NOT useful.

Instead show:

- District-wise charts
- Complaint trends
- AI root-cause analysis
- Cluster statistics
- Resolution performance

## Dashboard Screens

### Screen 1: Executive Dashboard

Cards:

- Total Complaints
- Total Departments
- Total Clusters
- Critical Issues
- Resolved Cases
- Pending Cases

Also show an AI Summary insight card.

### Screen 2: Department Management

Cards:

- Agriculture
- Roads
- Drainage
- Water
- Revenue
- Pension
- Electricity
- Health

Clicking department opens department dashboard.

### Screen 3: Department Dashboard

Contains:

- Complaint Table
- Filters
- Run Clustering Button
- Analytics

### Screen 4: Clustering Workspace

Sections:

- Raw Complaints
- Cluster Processing
- Cluster Results
- Cluster Intelligence

Cluster results should show affected citizens, first reported date, latest reported date, and district impact.

### Screen 5: Geographic Analytics

Contains:

- Heatmap
- Hotspot Detection
- Cluster Density

### Screen 6: AI Insights

Examples:

- Drainage complaints increased 60%
- Pension delays rising in District X
- Road safety risk detected near ABC School

## Transparency Features

- Complaint Tracking
- Department Assignment Visibility
- Resolution Timeline
- Status Updates

## Accountability Features

- Department Performance
- Average Resolution Time
- Pending Cases
- Escalation Metrics
- Resolution Rate

## MVP Scope

### Must Have

- Citizen Complaint Form
- AI Categorization
- AI Complaint Generation
- Executive Dashboard
- Department Dashboard
- Clustering
- Heatmap

### Nice to Have

- Root Cause Analysis
- AI Predictions
- Citizen Feedback
- Escalation Engine

## Recommended Architecture Flow

Raw Complaints

↓

AI Categorization

↓

Department Routing

↓

AI Clustering

↓

Heatmap / Analytics

↓

Governance Intelligence

## MVP Goal

Build a production-looking AI-powered governance intelligence platform that demonstrates:

- AI Categorization
- AI Complaint Generation
- AI Clustering
- Heatmaps
- Government Analytics
- Transparency
- Accountability

## Next Step

Start by designing the database schema, backend API structure, folder structure, and screen-by-screen implementation plan before writing code.
