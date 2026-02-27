# Task Manager

Full-stack task management application — NestJS REST API backend + React SPA frontend.

## Features

- **JWT Authentication** — login, persistent sessions via localStorage, auto-redirect on 401
- **Role-based access** — `admin` and `member` roles; admin-only pages guarded on both frontend and backend
- **Projects** — create and view projects with task progress bars
- **Tasks** — create, filter by status/priority, inline edit status/priority/assignee, full activity log per task
- **Team Members** — admin can create users and assign roles
- **Dashboard** — stat cards, tasks-by-status pie chart, tasks-by-member bar chart, recent tasks list, per-project progress
- **Internationalisation (i18n)** — English / Russian / German, switchable at runtime with language persisted in `localStorage`

---

## Stack

### Backend (`backend/`)

| | |
|---|---|
| Runtime | Node.js |
| Framework | NestJS |
| ORM | Prisma |
| Database | PostgreSQL (Supabase) |
| Auth | JWT (Bearer) + bcrypt |
| Validation | class-validator + class-transformer |

### Frontend (`frontend/`)

| | |
|---|---|
| Build tool | Vite 7 |
| UI library | React 19 + TypeScript 5.9 |
| Styling | Tailwind CSS v4 (`@tailwindcss/vite`) |
| Server state | TanStack Query v5 |
| Routing | React Router v7 |
| Client state | Zustand v5 |
| Charts | Recharts v3 |
| HTTP | Axios (JWT interceptor + 401 handler) |
| i18n | i18next + react-i18next + i18next-browser-languagedetector |
| Notifications | react-hot-toast |
| Icons | lucide-react |

---

## Project Structure

```
nestjsprac/
├── backend/                  # NestJS API — port 3000
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── seed.ts
│   │   └── migrations/
│   └── src/
│       ├── auth/             
│       ├── users/            
│       ├── projects/         
│       ├── tasks/            
│       ├── dashboard/        
│       ├── prisma/           
│       └── common/           
│
└── frontend/                 
    └── src/
        ├── pages/
        │   ├── LoginPage.tsx
        │   ├── DashboardPage.tsx
        │   ├── ProjectsPage.tsx
        │   ├── TasksPage.tsx
        │   └── UsersPage.tsx
        ├── components/
        │   ├── layout/       
        │   └── ui/           
        │                     
        ├── services/
        │   └── api.service.ts  
        ├── store/
        │   └── auth.store.ts   
        ├── lib/
        │   ├── api.ts          
        │   ├── utils.ts        
        │   ├── i18n.ts         
        │   └── locales/
        │       ├── en.json
        │       ├── ru.json
        │       └── de.json
        └── types/
            └── index.ts        
```

---

## Quick Start

> **Windows** — use PowerShell or CMD, not WSL/Git Bash.

### 1. Configure the backend environment

Create `backend/.env`:

```env
DATABASE_URL="postgresql://postgres.<project_ref>:<PASSWORD>@aws-1-<region>.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&sslmode=require"
DIRECT_URL="postgresql://postgres.<project_ref>:<PASSWORD>@aws-1-<region>.pooler.supabase.com:5432/postgres?sslmode=require"
JWT_SECRET="dev_super_secret_change_me"
PORT="3000"
```

### 2. Start the backend

```powershell
cd backend
npm install
npx prisma generate
npx prisma migrate deploy
npm run prisma:seed
npm run start:dev
```

### 3. Start the frontend

```powershell
cd frontend
npm install
npm run dev
```

The Vite dev server proxies all `/api/*` requests to `http://127.0.0.1:3000` automatically.

---

## URLs

| Service | URL |
|---|---|
| Frontend (React SPA) | http://localhost:5173 |
| Backend API | http://127.0.0.1:3000 |
| Legacy HTML UI | http://127.0.0.1:3000/ui |

---

## Default Credentials

```
admin@example.com  /  admin123
```

---

## Frontend Pages

| Page | Route | Access | Description |
|---|---|---|---|
| Login | `/login` | Public | Email/password sign-in with language switcher |
| Dashboard | `/dashboard` | All users | Stat cards, pie chart, bar chart, recent tasks, project progress |
| Projects | `/projects` | All users | Project grid with task counts and progress bars; create new project |
| Tasks | `/tasks` | All users | Filterable task table; create task, edit status/priority/assignee, view activity log |
| Team Members | `/users` | Admin only | User table with roles; create new team member |

---

## Internationalisation

The UI supports three languages switchable via the language buttons in the sidebar and login page:

| Code | Language |
|---|---|
| `en` | English |
| `ru` | Русский (Russian) — includes correct plural forms |
| `de` | Deutsch (German) |

The selected language is stored in `localStorage` and restored on next visit.

---

## API Endpoints

### Auth
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/login` | — | Returns `{ access_token }` |
| GET | `/auth/me` | Bearer | Current user object |

### Users _(admin only)_
| Method | Path | Auth |
|---|---|---|
| GET | `/users` | Bearer (admin) |
| POST | `/users` | Bearer (admin) |

### Projects
| Method | Path | Auth |
|---|---|---|
| GET | `/projects` | Bearer |
| POST | `/projects` | Bearer |

### Tasks
| Method | Path | Query params | Auth |
|---|---|---|---|
| GET | `/tasks` | `status`, `priority`, `project_id`, `assigned_to` | Bearer |
| POST | `/tasks` | — | Bearer |
| PATCH | `/tasks/:id` | — | Bearer |
| GET | `/tasks/:id/activity` | — | Bearer |

### Dashboard
| Method | Path | Auth |
|---|---|---|
| GET | `/dashboard` | Bearer |

---

## Useful Commands

### Backend

```powershell
cd backend
npm run start:dev   # watch mode
npm run build
npm run lint
npx prisma studio   # GUI database browser
```

### Frontend

```powershell
cd frontend
npm run dev         # dev server with HMR
npm run build       # production build
npm run preview     # preview production build
npx tsc -b --noEmit # type-check without emitting
```

---

## Troubleshooting

**`P1001 Can't reach database server`**  
`DIRECT_URL` may need to point to the pooler on `:5432` instead of `db.<project>.supabase.co:5432` on IPv4-restricted networks.

**`P1000 Authentication failed`**  
Check the DB password. URL-encode special characters (`!`, `@`, `[`, `]`, etc.).

**`EADDRINUSE: 3000`**  
Another process is on port 3000. Kill it or use a different port:
```powershell
$env:PORT="3001"; npm run start:dev
```

**Frontend shows "Invalid email or password" on valid credentials**  
Ensure the backend is running on port 3000 and the `JWT_SECRET` in `.env` is set.
