# Task Manager

## Stack

- NestJS
- Prisma
- PostgreSQL
- Plain HTML UI in `ui/`

## Run on Windows (PowerShell)

Use Windows PowerShell or CMD. Do not run this project from WSL/Git Bash.

1. Install:
- Node.js 20+
- PostgreSQL 14+ (with psql)

2. Find your actual `psql.exe` path:

```powershell
Get-ChildItem "C:\Program Files\PostgreSQL\*\bin\psql.exe" -ErrorAction SilentlyContinue | Select-Object -ExpandProperty FullName
```

3. Create DB/user (one time):

```powershell
$psql = "C:\Program Files\PostgreSQL\17\bin\psql.exe" # replace path with your version
& $psql -U postgres -c "CREATE USER task_user WITH PASSWORD 'task_pass';"
& $psql -U postgres -c "CREATE DATABASE task_db OWNER task_user;"
```

4. Create `backend/.env`:

```env
DATABASE_URL="postgresql://task_user:task_pass@127.0.0.1:5432/task_db?schema=public"
JWT_SECRET="dev_super_secret_change_me"
PORT="3000"
```

5. Install dependencies and start backend:

```powershell
cd backend
if (Test-Path .\node_modules) { Remove-Item -Recurse -Force .\node_modules }
npm install
npx prisma generate
npx prisma migrate deploy
npm run prisma:seed
npm run start:dev
```

## Run on Ubuntu

1. Create DB/user (one time):

```bash
sudo -u postgres psql -c "CREATE USER task_user WITH PASSWORD 'task_pass';"
sudo -u postgres psql -c "CREATE DATABASE task_db OWNER task_user;"
```

2. Then use the same `backend/.env` and backend startup commands as above.

## Troubleshooting (Windows)

1. `psql.exe is not recognized`
- Your PostgreSQL path is different. Run:
```powershell
Get-ChildItem "C:\Program Files\PostgreSQL\*\bin\psql.exe" -ErrorAction SilentlyContinue | Select-Object -ExpandProperty FullName
```

2. `Error: P3014` (`permission denied to create database`)
- `prisma migrate dev` needs shadow DB create permissions.
- For this project startup, use `npx prisma migrate deploy` instead.
- Optional: grant permission if you need `migrate dev`:
```sql
ALTER ROLE task_user CREATEDB;
```

3. TypeScript errors like `no exported member 'TaskWhereInput'` or `Module '@prisma/client' has no exported member 'User'`
- Prisma Client was not generated correctly.
- Fix:
```powershell
if (Test-Path .\node_modules\.prisma) { Remove-Item -Recurse -Force .\node_modules\.prisma }
npx prisma generate
```

4. `'nest' is not recognized` or `'prisma' is not recognized`
- Run commands from `backend` directory in PowerShell/CMD.
- Reinstall dependencies on Windows:
```powershell
cd backend
if (Test-Path .\node_modules) { Remove-Item -Recurse -Force .\node_modules }
npm install
```

5. `Cannot find module ...\dist\main`
- This usually happens because stale TypeScript incremental cache skipped re-emit.
- Fix:
```powershell
cd backend
if (Test-Path .\tsconfig.build.tsbuildinfo) { Remove-Item .\tsconfig.build.tsbuildinfo -Force }
npm run build
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
