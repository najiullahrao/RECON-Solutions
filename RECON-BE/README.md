# RECON Backend

Express API for the RECON construction/consulting platform. Handles auth (Supabase), projects, services, consultations, appointments, image uploads (Cloudinary), AI (Groq), and analytics.

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Environment**
   - Copy `.env.example` to `.env`
   - Fill in required values (see below). At minimum: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`

3. **Run**
   ```bash
   npm run dev   # development (watch mode)
   npm start    # production
   ```

Server runs on `http://localhost:5000` (or `PORT` from `.env`). Health check: `GET /health`.

## Env vars

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Server port (default 5000) |
| `SUPABASE_URL` | Yes | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key |
| `CLOUDINARY_*` | For uploads | Cloud name, API key, API secret |
| `GROQ_API_KEY` | For AI routes | Groq API key for `/ai/ask` and `/ai/chat` |
| `FRONTEND_URL` | No | Allowed CORS origin (optional) |

## API overview

| Prefix | Description |
|--------|-------------|
| `/auth` | Register, login |
| `/services` | Services list/detail, create/update/deactivate (admin) |
| `/projects` | Projects list/detail with search/filters, CRUD (admin/staff) |
| `/consultations` | Submit request (public), list/update (admin/staff), my (user) |
| `/appointments` | Create, my (user), list/update status (admin/staff) |
| `/upload` | Image upload/delete (admin/staff) |
| `/ai` | Ask, chat (public) |
| `/analytics` | Stats, trends, popular services (admin/staff) |

Roles: **USER** (default), **STAFF**, **ADMIN**. Auth via `Authorization: Bearer <token>`.

## Project structure

- `src/config` – app config, Supabase, Cloudinary
- `src/constants` – roles, status enums
- `src/middleware` – auth, role, upload
- `src/routes` – API route handlers
- `src/utils` – helpers (e.g. sanitize)
