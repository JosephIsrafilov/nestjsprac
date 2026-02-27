# Task Manager

Task management API on NestJS + Prisma with PostgreSQL (Supabase) and plain HTML UI.

## Stack

- NestJS
- Prisma
- PostgreSQL (Supabase)
- Plain HTML UI in `ui/`

## Supabase Database

Project is connected to Supabase Postgres.

![Supabase DB Schema](![alt text](image.png))

## Quick Start (Windows PowerShell)

Use PowerShell or CMD (not WSL/Git Bash).

1. Install Node.js 20+.
2. Create `backend/.env`:

```env
DATABASE_URL="postgresql://postgres.<project_ref>:<PASSWORD_ENCODED>@aws-1-<region>.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&sslmode=require"
DIRECT_URL="postgresql://postgres.<project_ref>:<PASSWORD_ENCODED>@aws-1-<region>.pooler.supabase.com:5432/postgres?sslmode=require"
JWT_SECRET="dev_super_secret_change_me"
PORT="3000"
```

3. Run backend:

```powershell
cd backend
npm install
npx prisma generate
npx prisma migrate deploy
npm run prisma:seed
npm run start:dev
```

## Open

- API root: `http://127.0.0.1:3000/`
- UI: `http://127.0.0.1:3000/ui`

## Default Login

- `admin@example.com`
- `admin123`

## Main Endpoints

- `POST /auth/login`
- `GET /auth/me`
- `POST /users`
- `GET /users`
- `POST /projects`
- `GET /projects`
- `POST /tasks`
- `GET /tasks`
- `PATCH /tasks/:id`
- `GET /tasks/:id/activity`
- `GET /dashboard`

## Project Commands

```bash
cd backend
npm run lint
npm run build
```

## Troubleshooting

1. `P1001 Can't reach database server`
- Usually `DIRECT_URL` points to `db.<project>.supabase.co:5432` on IPv4-restricted network.
- Use pooler `:5432` as `DIRECT_URL` if needed.

2. `P1000 Authentication failed`
- Check DB password.
- URL-encode special characters in password (`!`, `@`, `[`, `]`, etc.).

3. `EADDRINUSE: 3000`
- Another process is already running on port 3000.
- Kill it or run with another port (`$env:PORT="3001"`).
