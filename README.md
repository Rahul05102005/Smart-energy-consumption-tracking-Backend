# EnergyTrack backend

Express API for the EnergyTrack frontend, backed by MongoDB and JWT authentication.

## Local setup

1. Install dependencies with `npm install`.
2. Put the required values directly in `.env`: `PORT`, `MONGODB_URI`, `MONGODB_DB_NAME`, `JWT_SECRET` (at least 32 random characters), `JWT_EXPIRES_IN`, and `CLIENT_URL`. Set the optional `RESET_TOKEN_EXPIRES_MINUTES` and SMTP variables if you want password recovery emails.
3. Start MongoDB or configure `MONGODB_URI` for your Atlas cluster.
4. Start the API with `npm run dev`.

On startup, the API creates its MongoDB collections and indexes if they do not exist. Collection schemas are based on the migration references in `schema/migrations/`.

## API routes

- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- `POST /api/auth/forgot-password`, `POST /api/auth/reset-password`, `PATCH /api/auth/password`
- `GET/PATCH /api/profile`, `GET/PATCH /api/settings`
- `GET/POST /api/appliances`, `PATCH/DELETE /api/appliances/:id`, `GET /api/usage-history`
- `GET/POST /api/challenges`, `PATCH /api/challenges/:id/complete`, `DELETE /api/challenges/:id`
- `GET /api/recommendations`, `POST /api/recommendations/sync`
- `GET /api/health`

All routes other than health and the public auth routes require a bearer JWT.

## Vercel

Deploy this folder as the Vercel project root. Add the same required values from `.env` in Vercel Project Settings. Set `CLIENT_URL` to the deployed frontend origin and configure `VITE_API_URL` in the frontend project to this backend's deployed origin.
