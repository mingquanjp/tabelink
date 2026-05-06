# Tabelink Owner Portal

Owner portal for managing restaurant operations. The project is split into a Next.js frontend, a NestJS backend, and database SQL assets.

## Tech Stack

- Frontend: Next.js, React, TypeScript, Tailwind CSS
- Backend: NestJS, TypeScript, TypeORM
- Database: PostgreSQL on NeonDB
- Package manager: npm

## Requirements

- Node.js >= 20.9
- npm
- Git
- NeonDB account
- PostgreSQL client, for example DBeaver, pgAdmin, or psql

## Project Structure

```text
.
|-- backend/              # NestJS API
|-- frontend/             # Next.js app
|-- database/
|   |-- migrations/       # SQL migration files
|   `-- seeds/            # SQL seed files
|-- docs/                 # Project documentation
`-- README.md
```

## Environment Files

Do not commit real `.env` files.

Backend:

```powershell
cd backend
Copy-Item .env.example .env
```

Update `backend/.env` with the real NeonDB connection string:

```env
APP_PORT=8080
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
DATABASE_URL=postgresql://USER:PASSWORD@HOST.neon.tech/tabelink_dev?sslmode=require
JWT_SECRET=change_me
```

Frontend:

```powershell
cd frontend
Copy-Item .env.local.example .env.local
```

Default frontend env:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

## Install Dependencies

Install backend dependencies:

```powershell
cd backend
npm install
```

Install frontend dependencies:

```powershell
cd frontend
npm install
```

## Run Backend

```powershell
cd backend
npm run start:dev
```

Backend URL:

```text
http://localhost:8080
```

Health checks:

```text
http://localhost:8080/health
http://localhost:8080/db-health
```

Expected responses:

```json
{ "status": "ok" }
```

```json
{ "database": "connected" }
```

If PowerShell blocks `npm`, use:

```powershell
npm.cmd run start:dev
```

## Run Frontend

```powershell
cd frontend
npm run dev
```

Frontend URL:

```text
http://localhost:3000
```

Development health page:

```text
http://localhost:3000/dev-health
```

Placeholder routes:

```text
/login
/register
/owner/dashboard
/owner/menu
/owner/reservations
/owner/campaigns
```

## Verification

Backend:

```powershell
cd backend
npm run build
npm test -- --runInBand
npm run test:e2e -- --runInBand
```

Frontend:

```powershell
cd frontend
npm run lint
npm run build
```

## Branching Rule

- `main`: stable/demo branch
- `develop`: integration branch
- `feature/*`: feature branches created from `develop`

Recommended workflow:

```powershell
git checkout develop
git checkout -b feature/dev-environment
```

Open pull requests into `develop`.

## Completion Checklist

- Backend runs on `http://localhost:8080`
- Frontend runs on `http://localhost:3000`
- `/health` returns `{ "status": "ok" }`
- `/db-health` connects to NeonDB
- Frontend `/dev-health` calls the backend successfully
- Real `.env` files are not committed
- Another team member can clone, install, configure env, and run both apps from this README
