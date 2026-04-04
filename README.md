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
├── frontend/     # React app
├── backend/      # Express API
└── scripts/      # bash scripts (TMDB data seed / API testing (httpie))
```

---

## Local Development

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

## Deployment

### Backend → Render

1. Push the `backend/` folder to a GitHub repository
2. On [Render](https://render.com): **New → Web Service** → connect the repo
3. Set build and start commands:
   ```
   Build:  npm install && npm run build
   Start:  npm start
   ```
4. Add environment variables (all from `.env` above, plus a production `MONGO_URI`)
5. Deploy — note the service URL (e.g. `https://your-app.onrender.com`)

### Frontend → Netlify

1. Push the `frontend/` folder to a GitHub repository
2. On [Netlify](https://netlify.com): **Add new site → Import from Git**
3. Set build settings:
   ```
   Build command:   npm run build
   Publish directory: dist
   ```
4. Add environment variable:
   ```
   VITE_API_URL = https://your-app.onrender.com/api
   ```
5. Deploy

### Database → MongoDB Atlas

1. Create a free M0 cluster at [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a database user with read/write access
3. Add `0.0.0.0/0` to the network access list (or Render's outbound IP)
4. Copy the connection string and set it as `MONGO_URI` in both local `.env` and Render

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

---

## License

ISC
