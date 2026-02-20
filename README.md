# Task Manager

Just a simple task tracking app built with NestJS and Prisma. Nothing fancy, works with the UI in the parent folder.

## What's inside

- NestJS for the backend stuff
- Prisma talking to PostgreSQL
- JWT for auth
- Pretty basic project/task management

## Getting it running on Ubuntu

You'll need Node.js and PostgreSQL installed. Then set up your database:

```bash
sudo -u postgres psql -c "CREATE USER task_user WITH PASSWORD 'task_pass';"
sudo -u postgres psql -c "CREATE DATABASE task_db OWNER task_user;"
```

Make a `.env` file in the backend folder:

```env
DATABASE_URL="postgresql://task_user:task_pass@127.0.0.1:5432/task_db?schema=public"
JWT_SECRET="dev_super_secret_change_me"
PORT="3000"
```

Then:

```bash
cd backend
npm install
npx prisma migrate dev --name init
npm run prisma:seed
npm run start:dev
```
Go to `http://localhost:3000/` and you see Swagger
Go to `http://localhost:3000/ui` and you able to work with ui

## Login

Default account is admin@example.com / admin123

## The API

Main endpoints:

- POST /auth/login - get your token
- GET /auth/me - check who you are
- POST /users - create users (admins only)
- GET /users - list everyone
- POST /projects - make a project
- GET /projects - see all projects
- POST /tasks - create a task
- GET /tasks - list tasks (can filter by status, assigned_to, dates, or search)
- PATCH /tasks/:id - update a task
- GET /tasks/:id/activity - see what changed
- GET /dashboard - some stats

