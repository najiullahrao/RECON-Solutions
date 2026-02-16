# RECON Solutions – Frontend

React frontend for the RECON Solutions construction & services platform. Built with Vite, TypeScript, Tailwind CSS, and React Router.

## Features

- **Public**: Home, Services, Projects, Request consultation, Book appointment (requires login), AI Assistant
- **Authenticated**: My Appointments, My Consultations, Dashboard (analytics for staff/admin)
- **Layout**: Collapsible sidebar navigation + top bar; responsive (sidebar toggles on mobile)

## Setup

```bash
npm install
npm run dev
```

Dev server runs at `http://localhost:5173`. By default, API requests go to `/api` and Vite proxies them to `http://localhost:5000`. Ensure the backend is running on port 5000.

## Environment

API base URL is controlled by **`VITE_API_URL`** (see `src/config/env.ts` and `.env.example`).

| Scenario | What to do |
|----------|------------|
| **Dev, backend on localhost:5000** | Do nothing. Frontend uses `/api` and the proxy sends to `http://localhost:5000`. |
| **Dev, backend at another URL** | Create `.env` with `VITE_API_URL=http://localhost:5000` or your backend URL (no trailing slash). |
| **Production, deployed backend** | Set `VITE_API_URL` when building, e.g. `VITE_API_URL=https://api.yoursite.com npm run build`. Or put `VITE_API_URL=https://api.yoursite.com` in `.env` (and use `.env.production` or your host’s env config). |

The frontend never adds a path prefix; your backend should be served at the root of that URL (e.g. `https://api.yoursite.com/projects`, not `https://api.yoursite.com/api/projects`).

## Scripts

- `npm run dev` – Start dev server
- `npm run build` – Production build
- `npm run preview` – Preview production build
- `npm run lint` – Run ESLint

## Structure

- `src/api/` – API client and endpoint modules
- `src/components/` – Reusable UI and layout (Button, Input, Card, Sidebar, Topbar)
- `src/config/` – App config (e.g. API base URL)
- `src/constants/` – Routes and shared constants
- `src/contexts/` – Auth context
- `src/lib/` – Utilities (e.g. `cn`)
- `src/pages/` – Route-level pages
- `src/types/` – Shared TypeScript types
