# CivicEye AI FastAPI API Plan

This document defines the backend API surface for the CivicEye AI server side.
It lists the required endpoints only, without request body details, so the service structure is easy to understand before implementation.

## API Design Goals

- Keep citizen, admin, AI, and analytics concerns separated.
- Make complaint lifecycle and transparency visible through dedicated endpoints.
- Support both geographic and non-geographic complaint flows.
- Keep the API versioned from the start.

## API Version

- Base path: `/api/v1`

## 1. System APIs

### `GET /health`
Purpose: Check service health.

### `GET /ready`
Purpose: Check readiness, including database connectivity.

### `GET /version`
Purpose: Return application and model version information.

## 2. Citizen APIs

### `POST /complaints`
Purpose: Submit a new civic complaint.

### `GET /complaints/{complaint_code}`
Purpose: Track a complaint by public complaint code.

### `GET /complaints/{complaint_code}/timeline`
Purpose: View complaint lifecycle events for transparency.

### `GET /categories`
Purpose: List available complaint categories.

### `GET /departments`
Purpose: List available departments for routing.

### `POST /uploads/image`
Purpose: Upload an optional complaint image.

## 3. Admin Complaint APIs

### `GET /admin/complaints`
Purpose: List complaints with filters.

### `GET /admin/complaints/{complaint_id}`
Purpose: View detailed complaint information.

### `PATCH /admin/complaints/{complaint_id}/status`
Purpose: Update complaint status.

### `PATCH /admin/complaints/{complaint_id}/assignment`
Purpose: Assign or reassign a complaint to a department.

### `GET /admin/complaints/{complaint_id}/history`
Purpose: View complaint status and activity history.

## 4. Department APIs

### `GET /admin/departments`
Purpose: List departments.

### `POST /admin/departments`
Purpose: Create a department.

### `PATCH /admin/departments/{department_id}`
Purpose: Update department details.

### `DELETE /admin/departments/{department_id}`
Purpose: Disable or remove a department if needed.

### `GET /admin/departments/{department_id}/dashboard`
Purpose: Load department-specific dashboard data.

## 5. Category APIs

### `GET /admin/categories`
Purpose: List categories.

### `POST /admin/categories`
Purpose: Create a category.

### `PATCH /admin/categories/{category_id}`
Purpose: Update a category.

### `DELETE /admin/categories/{category_id}`
Purpose: Disable or remove a category if needed.

## 6. AI Intelligence APIs

### `POST /ai/analyze`
Purpose: Analyze a raw complaint and return category, department, severity, confidence, and summary.

### `POST /ai/generate`
Purpose: Generate a normalized complaint version from citizen input.

### `POST /ai/reclassify`
Purpose: Re-run AI categorization for existing complaints.

### `POST /ai/insights`
Purpose: Generate AI insight statements for dashboards.

## 7. Clustering APIs

### `POST /admin/clusters/run`
Purpose: Run clustering across complaints.

### `GET /admin/clusters`
Purpose: List complaint clusters.

### `GET /admin/clusters/{cluster_id}`
Purpose: View a specific cluster.

### `GET /admin/clusters/{cluster_id}/complaints`
Purpose: List complaints included in a cluster.

### `PATCH /admin/clusters/{cluster_id}`
Purpose: Update cluster metadata such as name, priority, or status.

## 8. Geographic Analytics APIs

### `GET /admin/analytics/heatmap`
Purpose: Return geographic heatmap points.

### `GET /admin/analytics/hotspots`
Purpose: Return hotspot detection results.

### `GET /admin/analytics/cluster-density`
Purpose: Return density metrics for map visualization.

## 9. Non-Geographic Analytics APIs

### `GET /admin/analytics/trends`
Purpose: Return complaint trend charts for non-geographic departments.

### `GET /admin/analytics/district-performance`
Purpose: Return district-wise complaint performance data.

### `GET /admin/analytics/root-cause`
Purpose: Return AI root-cause analysis summaries.

## 10. Executive Dashboard APIs

### `GET /admin/dashboard/executive`
Purpose: Load top-level executive dashboard metrics.

### `GET /admin/dashboard/insight-card`
Purpose: Return the AI summary card for leadership.

### `GET /admin/dashboard/transparency`
Purpose: Return transparency metrics.

### `GET /admin/dashboard/accountability`
Purpose: Return accountability metrics.

## 11. Reporting and Export APIs

### `GET /admin/reports/complaints`
Purpose: Export complaint data.

### `GET /admin/reports/clusters`
Purpose: Export cluster data.

### `GET /admin/reports/analytics`
Purpose: Export analytics snapshots.

## 12. Audit and History APIs

### `GET /admin/audit-logs`
Purpose: View system activity logs.

### `GET /admin/complaints/{complaint_id}/status-history`
Purpose: View complaint lifecycle history.

## 13. MVP Priority Order

### Must Have

- `POST /complaints`
- `GET /complaints/{complaint_code}`
- `POST /ai/analyze`
- `POST /ai/generate`
- `GET /admin/dashboard/executive`
- `GET /admin/complaints`
- `PATCH /admin/complaints/{complaint_id}/status`
- `POST /admin/clusters/run`
- `GET /admin/clusters`
- `GET /admin/analytics/heatmap`

### Next Phase

- Root cause analysis
- Predictions
- Citizen feedback
- Escalation engine
- Reporting and export
- Audit logs

## 14. Recommended Backend Folder Structure

- `app/main.py`
- `app/core/config.py`
- `app/core/database.py`
- `app/core/security.py`
- `app/api/v1/routes/complaints.py`
- `app/api/v1/routes/admin.py`
- `app/api/v1/routes/ai.py`
- `app/api/v1/routes/analytics.py`
- `app/models/`
- `app/schemas/`
- `app/services/`
- `app/repositories/`
- `app/ai/`
- `app/tasks/`
- `app/utils/`

## 15. Suggested Build Order

1. Health and readiness endpoints.
2. Complaint submission and tracking.
3. AI analysis and generated complaint normalization.
4. Admin complaint list and status updates.
5. Department and category masters.
6. Clustering APIs.
7. Executive dashboard metrics.
8. Heatmap and analytics endpoints.
9. Audit logs and exports.
