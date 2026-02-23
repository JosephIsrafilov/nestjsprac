# Task Manager

## Stack

- NestJS
- Prisma
- PostgreSQL
- Plain HTML UI in `ui/`

## Run on Windows

1. Install:

- Node.js 20+
- PostgreSQL 14+ (with psql)

2. Create DB/user (one time):

```powershell
& "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -c "CREATE USER task_user WITH PASSWORD 'task_pass';"
& "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -c "CREATE DATABASE task_db OWNER task_user;"
```

## Run on Ubuntu

1. Create DB/user (one time):

```bash
sudo -u postgres psql -c "CREATE USER task_user WITH PASSWORD 'task_pass';"
sudo -u postgres psql -c "CREATE DATABASE task_db OWNER task_user;"
```

## (Same steps for Windows)

2. Create `backend/.env`:

```env
DATABASE_URL="postgresql://task_user:task_pass@127.0.0.1:5432/task_db?schema=public"
JWT_SECRET="dev_super_secret_change_me"
PORT="3000"
```

3. Start backend:

```bash
cd backend
npm install
npx prisma migrate dev --name init
npm run prisma:seed
npm run start:dev
```

## Open

- API root: `http://127.0.0.1:3000/`
- UI: `http://127.0.0.1:3000/ui`

## Default login

- `admin@example.com`
- `admin123`

## Main endpoints

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

## Project mode

```bash
cd backend
npm run lint
npm run build
```
