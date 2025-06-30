# Kysely React + MongoDB Project

This project is a modernized version of the Taitaja25_Naytto quiz/admin app, rebuilt with:
- **Frontend:** React + TypeScript (Vite)
- **Backend:** Node.js + Express + TypeScript
- **Database:** MongoDB (local or Atlas)
- **Auth:** Session-based authentication

## Folders
- `frontend/` — React app (Vite, TypeScript)
- `backend/` — Express API (TypeScript, MongoDB)

## Getting Started

### 1. Install dependencies
- In `frontend/`: `npm install`
- In `backend/`: `npm install`

### 2. Development
- Start frontend: `npm run dev` (in `frontend/`)
- Start backend: `npx ts-node src/index.ts` (in `backend/`)

### 3. Environment
- Backend expects a `.env` file in `backend/` with at least:
  - `MONGODB_URI=mongodb://localhost:27017/kysely`
  - `SESSION_SECRET=your_secret_here`

## Features
- Admin and user interfaces
- Quiz management, categories, users, results
- Responsive, modern UI
- Session-based login

---

For more details, see code comments and documentation.
