# File Changes Log

| Date | File | Action | Purpose |
|------|------|--------|---------|
| 2026-09-07 | `orca/docker-compose.yml` | Created | Sets up PostgreSQL + PostGIS, and Redis for the backend environment. |
| 2026-09-07 | `orca/backend/Cargo.toml` | Created | Initialized the Rust backend project using Cargo. |
| 2026-09-07 | `orca/backend/migrations/20260907000001_init.sql` | Created | SQLx migration defining the initial schema for the OilWatch application, including PostGIS and core tables. |
| 2026-09-07 | `orca/backend/src/*` | Created | Created empty subdirectories (`config`, `routes`, `handlers`, `services`, `repositories`, `models`, `middleware`, `jobs`, `websocket`, `errors`) to structure the Axum application. |
| 2026-09-07 | `orca/backend/src/models/` | Created | Added `user`, `investigation`, and `auth` models for serialization and DB representation. |
| 2026-09-07 | `orca/backend/src/config/` | Created | Setup `Settings` struct to load `DATABASE_URL` and `JWT_SECRET`. |
| 2026-09-07 | `orca/backend/src/middleware/auth.rs` | Created | Created JWT verification middleware for securing routes. |
| 2026-09-07 | `orca/backend/src/repositories/` | Created | Implemented `UserRepository` and `InvestigationRepository` using SQLx. |
| 2026-09-07 | `orca/backend/src/handlers/` | Created | Added `auth_handler` and `investigation_handler` REST endpoints. |
| 2026-09-07 | `orca/backend/src/main.rs` | Updated | Wired the router, DB pool, and HTTP server entrypoint. |
| 2026-09-07 | `orca/backend/src/jobs/` | Created | Added background worker stub for pulling async jobs. |
| 2026-09-07 | `orca/backend/src/websocket/` | Created | Implemented WS endpoint for progress updates. |
| 2026-09-07 | `orca/backend/src/services/ais_service.rs` | Created | Added AIS querying & ingestion mock endpoints. |
| 2026-09-07 | `orca/backend/src/services/attribution_service.rs` | Created | Added Candidate ranking logic mock. |
| 2026-09-07 | `orca/frontend/` | Created | Initialized Vite + React + TS project. |
| 2026-09-07 | `orca/frontend/package.json` | Updated | Installed Tailwind, TanStack Query, MapLibre, Recharts, and React Router. |
| 2026-09-07 | `orca/frontend/tailwind.config.js` | Updated | Configured Tailwind theme. |
| 2026-09-07 | `orca/frontend/src/index.css` | Created | Defined core CSS and Tailwind directives. |
| 2026-09-07 | `orca/frontend/src/App.tsx` | Updated | Set up TanStack Query Client and React Router layout. |
| 2026-09-07 | `orca/frontend/src/pages/` | Created | Scaffolding Home, Login, Dashboard, Investigations, and InvestigationDetail views. |
| 2026-09-07 | `orca/frontend/tsconfig.json` | Updated | Configured typescript with bundler module resolution. |
| 2026-09-07 | `orca/frontend/vite.config.ts` | Updated | Setup proxy to Rust backend API and added @tailwindcss/vite. |
| 2026-09-07 | `orca/frontend/index.html` | Updated | Added Inter and JetBrains Mono fonts per DESIGN.md. |
| 2026-09-07 | `orca/frontend/src/index.css` | Updated | Added design system primitives and typography based on nocturne_maritime. |
| 2026-09-07 | `orca/frontend/src/main.tsx` | Created | Added providers for Tanstack Query and React Router. |
| 2026-09-07 | `orca/frontend/src/components/AppShell.tsx` | Created | Implemented the persistent side navigation layout. |
| 2026-09-07 | `orca/frontend/src/pages/Landing.tsx` | Created | Setup public landing page with problem statements and design layout. |
| 2026-09-07 | `orca/frontend/src/pages/Login.tsx` | Created | Setup login form with auth proxying to the backend API. |
| 2026-09-07 | `orca/frontend/src/pages/Dashboard.tsx` | Created | Dashboard metrics and recent investigations data table using TanStack query. |
| 2026-09-07 | `orca/frontend/src/pages/Investigations.tsx` | Created | Display investigation list and query parameters. |
| 2026-09-07 | `orca/frontend/src/pages/Reports.tsx` | Created | Placeholder screen for reports. |
| 2026-09-07 | `orca/frontend/src/pages/Settings.tsx` | Created | Settings layout mockup. |
| 2026-09-07 | `orca/frontend/src/pages/InvestigationDetail.tsx` | Created | Added maplibre integration, polling for drift model jobs, and layout styling. |
| 2026-09-07 | `orca/frontend/src/pages/VesselDetail.tsx` | Created | Setup candidate ranking component and AIS map view. |
| 2026-09-07 | `orca/frontend/postcss.config.cjs` | Created | PostCSS config (CJS) for Tailwind v3 compat. |
| 2026-09-07 | `orca/frontend/tailwind.config.cjs` | Created | Tailwind v3 config (CJS) with content paths. |
| 2026-09-07 | `orca/frontend/src/index.css` | Updated | Fixed Tailwind directives — switched from v4 `@theme` to v3 `@tailwind base/components/utilities` + `:root` vars inside `@layer base`. |
| 2026-09-07 | `orca/backend/Cargo.toml` | Updated | Added `sha2`, `hex` deps for password hashing; enabled axum `multipart` feature. |
| 2026-09-07 | `orca/backend/src/handlers/auth_handler.rs` | Updated | Rewrote register/login with SHA-256 hashing, duplicate email check, and JSON error responses. |
| 2026-09-07 | `orca/backend/src/handlers/upload_handler.rs` | Created | Multipart satellite image upload endpoint — saves to `./uploads/`, returns `image_id` + `image_path`. |
| 2026-09-07 | `orca/backend/src/handlers/mod.rs` | Updated | Registered `upload_handler` module. |
| 2026-09-07 | `orca/backend/src/routes/mod.rs` | Updated | Added `/upload/satellite` POST route. |
| 2026-09-07 | `orca/frontend/src/pages/Register.tsx` | Created | Full registration page with email/password/confirm, hitting `/api/v1/auth/register`. |
| 2026-09-07 | `orca/frontend/src/components/UploadModal.tsx` | Created | Drag-and-drop satellite image upload modal. Uploads file, then triggers detection job. |
| 2026-09-07 | `orca/frontend/src/pages/Login.tsx` | Updated | Now parses JSON error messages from backend; links to Register page. |
| 2026-09-07 | `orca/frontend/src/pages/Dashboard.tsx` | Updated | Wired upload modal; replaced fake stats with real pipeline status; shows real investigation data. |
| 2026-09-07 | `orca/frontend/src/App.tsx` | Updated | Added `/register` route. |
| 2026-09-07 | `orca/frontend/src/pages/Landing.tsx` | Updated | "Get Started" buttons now link to `/register`. |
| 2026-09-07 | `orca/backend/src/handlers/spill_handler.rs` | Updated | Auto-create investigation on detection upload, link job and spills to the investigation id, and return it to UI. |
| 2026-09-07 | `orca/backend/src/services/ml_service.rs` | Updated | Added mock JSON fallbacks for `detect` and `drift` endpoints if python server is not running. |
| 2026-09-07 | `orca/backend/src/models/investigation.rs` | Updated | Added `spill_info` JSON field to investigation model. |
| 2026-09-07 | `orca/backend/src/handlers/investigation_handler.rs` | Updated | Implemented subquery in GET `/investigations/:id` to automatically attach the latest spill geometry. |
| 2026-09-07 | `orca/frontend/src/components/AppShell.tsx` | Updated | Migrated from a left-side rail to a sleek top navigation header. |
| 2026-09-07 | `orca/frontend/src/pages/Dashboard.tsx` | Updated | Wired to navigate to `/investigations/:id` after successful upload. Removed emojis. |
| 2026-09-07 | `orca/frontend/src/pages/Landing.tsx` | Updated | Removed emojis from features matrix. |
| 2026-09-07 | `orca/frontend/src/components/UploadModal.tsx` | Updated | Receives `investigation_id` and passes it up for navigation. Removed emojis. |
| 2026-09-07 | `orca/frontend/src/pages/Investigations.tsx` | Updated | Removed emojis. |
| 2026-09-07 | `orca/frontend/src/pages/Reports.tsx` | Updated | Removed emojis. |
