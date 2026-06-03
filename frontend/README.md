# CivicEye AI Frontend

React + TypeScript + Vite frontend scaffold for the CivicEye AI platform.

## Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Recharts
- React Leaflet

## Setup

```bash
cd frontend
npm install
npm run dev
```

## Environment

Create a `.env` file if needed:

```bash
VITE_API_BASE_URL=http://localhost:8000
```

## Folder Structure

- `src/components/layout` - app shell, sidebar, topbar
- `src/components/ui` - reusable UI cards and primitives
- `src/features/complaints` - complaint form and related UI
- `src/features/dashboard` - executive dashboard widgets
- `src/features/clusters` - cluster workspace UI
- `src/features/analytics` - geographic analytics UI
- `src/pages` - route pages
- `src/services/api` - API client and endpoints
- `src/lib` - shared helpers
