# Project & Task Management Backend (NestJS)

Simple NestJS + Prisma backend for the assignment, using your existing `../ui` frontend and serving it at `/ui`.

## Stack
- NestJS
- Prisma ORM
- PostgreSQL
- JWT auth

## Ubuntu Prerequisites

1. Install Node.js (recommended via nvm) and npm.
2. Install PostgreSQL server/client.
3. Create DB and user:

```bash
sudo -u postgres psql -c "CREATE USER task_user WITH PASSWORD 'task_pass';"
sudo -u postgres psql -c "CREATE DATABASE task_db OWNER task_user;"
```

## Environment

Create/update `backend/.env`:

```env
DATABASE_URL="postgresql://task_user:task_pass@127.0.0.1:5432/task_db?schema=public"
JWT_SECRET="dev_super_secret_change_me"
PORT="3000"
```

## Install and Run

```bash
cd backend
npm install
npx prisma migrate dev --name init
npm run prisma:seed
npm run start:dev
```

Open:
- UI: `http://127.0.0.1:3000/ui`
- API root: `http://127.0.0.1:3000`

## Auth Defaults
- Email: `admin@example.com`
- Password: `admin123`

## API Routes
- `POST /auth/login`
- `GET /auth/me`
- `POST /users` (admin only)
- `GET /users`
- `POST /projects`
- `GET /projects`
- `POST /tasks`
- `GET /tasks` (supports filters: `status`, `assigned_to`, `due_from`, `due_to`, `search`)
- `PATCH /tasks/:id`
- `GET /tasks/:id/activity`
- `GET /dashboard`

## Assignment rules implemented
- Relational models: users, projects, tasks, task activity.
- Task status rule: no transition from `done` back to other states.
- Auto activity logs on task `status`, `assigned_to`, `title` changes.
- Member can create/update task only inside projects they created.
- Clear validation and error messages.

## Notes
- Task payload uses snake_case fields expected by `ui/index.html`: `project_id`, `assigned_to`, `due_date`.
