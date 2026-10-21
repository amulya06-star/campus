# campus. Student Marketplace

An account-based student project marketplace. The frontend requires the Express API and MongoDB; it no longer loads the local demo or uses sample users.

## Requirements

- Node.js 20.19+ (Vite 8 requirement)
- MongoDB locally or a MongoDB connection URI

## Run locally

1. Configure the backend:

```bash
cd backend
cp .env.example .env
```

Edit `.env` and set `JWT_SECRET` to a random secret of 32+ characters. `MONGO_URI` should point to your running MongoDB instance. Keep `CLIENT_URL=http://localhost:5173` for local development. Never commit `.env`.

2. Start the API in a terminal:

```bash
cd backend
npm install
npm run dev
```

The API starts on port 5000 only after MongoDB connects.

3. Start the frontend in another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open <http://localhost:5173>, create an account, and sign in. The Vite dev server proxies `/api` to the backend at `http://localhost:5000`. To use a separate API URL, set `VITE_API_URL` in `frontend/.env`.

## Included account-backed flows

- Registration and login with a seven-day JWT; a signed-in account can post and apply.
- Marketplace search/category filtering, persistent saved projects, project posting, applications, and owner-only applicant review/acceptance.
- Account-specific dashboard sections: posted projects, submitted applications, active work, and saved projects.
- Participant-only workspace access, persisted checklist/status actions, and database-backed project messages.
- Project lifecycle: open → in progress → submitted → completed; only the selected collaborator submits, and only the owner approves completion. The owner can cancel an open project.

## Two-account acceptance test

1. Register account A, post a project with a future deadline.
2. Open a private/incognito window, register account B, find the project, and apply.
3. Sign in as A; open the posted project and accept B.
4. Verify both accounts see the workspace and can message; try an unrelated third account and verify access is denied.
5. As B, submit the work; as A, approve completion. Check each dashboard shows only the current account’s own projects and applications.

Payments and file uploads are not implemented. Use HTTPS, secure MongoDB credentials, and a production secrets manager before deployment.
