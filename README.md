https://github.com/user-attachments/assets/9076a870-0665-4d20-a827-5cff9e6889a1

# Movie Tracker

A full-stack movie tracking application. Browse popular movies, search by title, and maintain a personal collection — favorites, watchlist, watched — with optional ratings and reviews.

Built with the MERN stack (MongoDB, Express, React, Node.js) using TypeScript on both ends.

---

## Features

**For everyone**
- Browse popular movies with infinite "Load More" pagination
- Full-text movie search
- Full movie detail pages — cast, crew, runtime, budget, revenue, tagline

**For signed-in users**
- Add/remove movies to Favorites, Watchlist, or Watched
- Rate movies 0–10 and write a text review
- Profile page with a watched-movie strip
- Instant UI feedback with automatic rollback on failure (optimistic updates)

**Admin** *(backend only — no UI yet)*
- Add, update, delete movies in the database
- Manage user accounts and admin roles

---

## Tech Stack

### Frontend
| | |
|---|---|
| React 19 + TypeScript | UI |
| Vite | Build tool |
| Tailwind CSS v4 | Styling |
| React Router v7 | Routing |
| Context API | State management |

### Backend
| | |
|---|---|
| Node.js + Express + TypeScript | API server |
| MongoDB + Mongoose | Database |
| JWT in httpOnly cookies | Authentication |
| bcryptjs | Password hashing |
| Zod | Request validation |
| express-rate-limit | Rate limiting |

---

## Repository Structure

```
movie-tracker/
├── frontend/               # React app + nginx Dockerfile
│   ├── src/
│   ├── Dockerfile
│   └── nginx.conf
├── backend/                # Express API Dockerfile
│   ├── src/
│   └── Dockerfile
├── docker-compose.yml      # Runs the full stack locally
└── scripts/                # TMDB data seed + API testing (httpie)
```

---

## Local Development (without Docker)

### Prerequisites
- Node.js 18+
- MongoDB (local instance or Atlas)

### 1. Backend

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/moviedb
JWT_SECRET=your-secret-key-min-32-chars
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

```bash
npm run dev
```

API runs at `http://localhost:5000`.

### 2. Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

```bash
npm run dev
```

App runs at `http://localhost:5173`.

---

## Running with Docker Compose

Docker Compose runs the full stack — backend API + frontend served by nginx — with a single command.

### Prerequisites
- Docker and Docker Compose installed

### 1. Create a `.env` file in the project root

```env
PORT=5000
NODE_ENV=production
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<dbname>
JWT_SECRET=your-secret-key-min-32-chars
```

> The `CLIENT_URL` and `VITE_API_URL` are hardcoded in `docker-compose.yml` because they refer to `localhost` — the host machine's loopback address where both containers are exposed.

### 2. Start everything

```bash
docker compose up --build
```

| Service | URL |
|---------|-----|
| Frontend (nginx) | http://localhost |
| Backend API | http://localhost:5000/api |

### 3. Stop

```bash
docker compose down
```

### How it works

```
Browser
  │
  ├── http://localhost        → frontend container (nginx:alpine, port 80)
  │                              serves static React build
  │
  └── http://localhost:5000   → backend container (node:20-alpine, port 5000)
                                 Express API → MongoDB Atlas
```

The frontend is a **static build** — Vite compiles the React app at Docker build time with `VITE_API_URL` baked into the JS bundle. nginx then serves those static files and handles React Router by forwarding all paths to `index.html`.

The backend uses a **multi-stage build**: TypeScript is compiled in a builder stage, then only the compiled `dist/` and production `node_modules` are copied to the final image, keeping it lean.

### Rebuilding after code changes

```bash
# Rebuild and restart a specific service
docker compose up --build backend
docker compose up --build frontend

# Rebuild all
docker compose up --build
```

### Useful commands

```bash
docker compose logs -f backend      # stream backend logs
docker compose logs -f frontend     # stream nginx logs
docker compose ps                   # list running containers
docker compose down --volumes       # stop and remove volumes
```

---

## Deployment

### Backend → AlwaysData (or any Docker host)

1. Build and push the backend image:
   ```bash
   docker build -t your-username/movie-backend ./backend
   docker push your-username/movie-backend
   ```
2. Set environment variables on the host (`PORT`, `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`, `NODE_ENV=production`)
3. Pull and run the image, or point the host at your GitHub repo if it supports Docker builds directly (Back4App, Railway, Render, etc.)

### Frontend → Netlify

```bash
cd frontend
VITE_API_URL=https://your-backend-url/api npm run build
# deploy the dist/ folder to Netlify
```

Or connect the `frontend/` directory to Netlify via GitHub and set `VITE_API_URL` in Netlify's environment variables — Netlify runs `npm run build` automatically on each push.

### Database → MongoDB Atlas

1. Create a free M0 cluster at [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a database user with read/write access
3. Add `0.0.0.0/0` to the network access list
4. Copy the connection string and set it as `MONGO_URI`

---

## Authentication Flow

```
Browser                     Backend                   Database
  │                            │                          │
  │  POST /api/auth/login       │                          │
  │ ─────────────────────────> │  verify credentials      │
  │                            │ ───────────────────────> │
  │                            │                          │
  │  Set-Cookie: access        │  store refresh token     │
  │  Set-Cookie: refresh       │ ───────────────────────> │
  │ <───────────────────────── │                          │
  │                            │                          │
  │  GET /api/user/me          │                          │
  │  (Cookie: access)          │                          │
  │ ─────────────────────────> │  verify JWT              │
  │  { user }                  │                          │
  │ <───────────────────────── │                          │
  │                            │                          │
  │  (access token expires)    │                          │
  │  POST /api/auth/refresh    │                          │
  │  (Cookie: refresh)         │  verify + issue new      │
  │ ─────────────────────────> │  access token            │
  │  Set-Cookie: access (new)  │                          │
  │ <───────────────────────── │                          │
```

The frontend never reads the JWT. All token handling is automatic via the `apiFetch` wrapper and httpOnly cookies.

---

## API Quick Reference

Full documentation in each sub-project's README.

| Area | Base path |
|------|-----------|
| Auth | `/api/auth` |
| Movies (public) | `/api/movie` |
| User profile | `/api/user/me` |
| User collection | `/api/user/me/movie` |

---

## Known Limitations

- No refresh token rotation — the same refresh token is reused until logout
- Collection pages fetch up to 500 items with no pagination in the UI
- Admin features have no frontend UI yet
- No password reset flow

## Planned for v2

- Refresh token rotation (one-time use)
- Password reset via email
- Admin dashboard
- Infinite scroll
- PWA / offline support
