## Seeding the Database
## Creating the Admin User "Pasi"

To create an admin user with username `Pasi` and password `mipeha`, run:

```
npx ts-node backend/scripts/create_admin_pasi.ts
```

This will add the user to your database if it does not already exist. If the user already exists, the script will not overwrite the password.

**Usage notes:**
- Make sure your MongoDB server is running and your connection string is set in `backend/.env` as `MONGODB_URI`.
- You can run this script safely; it will not duplicate the user.

To quickly set up example categories and questions, use the seed script:

```
npx ts-node backend/scripts/seed_database.ts
```

This will populate your MongoDB database with three categories (Tietotekniikka, Historia, Matematiikka), each containing 15 example questions. This is useful for testing and demo purposes.

**Usage notes:**
- Make sure your MongoDB server is running and your connection string is set in `backend/.env` as `MONGODB_URI`.
- The script will remove all existing categories and questions before adding new ones.
- You can safely run the script multiple times to reset the demo data.
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

## Features
- Admin and user interfaces
- Quiz management, categories, users, results
- Responsive UI
- Session-based login

