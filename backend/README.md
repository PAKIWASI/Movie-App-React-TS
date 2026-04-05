# Movie App — Backend API

REST API for a movie tracking application. Users can browse movies and maintain a personal collection with watchlists, favorites, ratings, and reviews. Built with Node.js, Express, TypeScript, and MongoDB.

---

## Tech Stack

| | |
|---|---|
| **Runtime** | Node.js + TypeScript |
| **Framework** | Express |
| **Database** | MongoDB via Mongoose |
| **Auth** | JWT — access + refresh tokens in httpOnly cookies |
| **Validation** | Zod |
| **Password hashing** | bcryptjs |
| **Rate limiting** | express-rate-limit |

---

## Project Structure

```
.
├── config/
│   └── db.ts                    # MongoDB connection
├── controllers/
│   ├── adminController.ts       # Admin CRUD + role assignment
│   ├── authController.ts        # Register, login, logout, token refresh
│   ├── movieController.ts       # Movie CRUD
│   ├── userController.ts        # User profile management
│   └── userMovieController.ts   # Personal collection (watchlist, favs, ratings)
├── middleware/
│   ├── adminMiddleware.ts       # Admin role guard
│   ├── authMiddleware.ts        # JWT auth + rate limiting
│   ├── errorHandler.ts          # 404 + global error handler
│   └── validate.ts              # Zod validation factory
├── models/
│   ├── Admin.ts                 # Admin role
│   ├── Movie.ts                 # Movie (TMDB data)
│   ├── MovieCredit.ts           # Cast + crew
│   ├── RefreshToken.ts          # Refresh token storage with TTL index
│   ├── User.ts                  # User account
│   └── UserMovie.ts             # User-movie relationship
├── routes/
│   ├── authRoutes.ts
│   ├── movieRoutes.ts
│   ├── userMovieRoutes.ts
│   └── userRoutes.ts
├── types/
│   ├── express.d.ts             # req.userid, req.role extensions
│   ├── movie.type.ts            # Zod schemas for TMDB movie data
│   ├── user.type.ts             # Zod schemas for user data
│   └── user_movie.type.ts       # Zod schemas for collection data
├── utils/
│   ├── paginate.ts              # page / limit / skip helpers
│   └── sanitize.ts              # Search query sanitization
├── Dockerfile                   # Multi-stage production build
└── index.ts                     # Entry point
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### Setup

```bash
git clone <repo-url>
cd backend
npm install
```

Create `.env`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/moviedb
JWT_SECRET=your-secret-key
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

```bash
npm run dev     # development with hot reload
npm run build   # compile TypeScript → dist/
npm start       # run compiled output
```

Server runs at `http://localhost:5000`.

---

## Docker

### Build the image

```bash
docker build -t movie-backend .
```

### Run the container

```bash
docker run -p 5000:5000 \
  -e PORT=5000 \
  -e MONGO_URI=mongodb+srv://... \
  -e JWT_SECRET=your-secret \
  -e CLIENT_URL=https://your-frontend.com \
  -e NODE_ENV=production \
  movie-backend
```

Or use an env file:

```bash
docker run -p 5000:5000 --env-file .env movie-backend
```

### How the Dockerfile works

The backend uses a **multi-stage build** to keep the final image small:

```
Stage 1 — builder (node:20-alpine)
  ├── Install all dependencies (npm ci)
  ├── Copy source files
  └── Compile TypeScript → dist/

Stage 2 — production (node:20-alpine)
  ├── Install production dependencies only (npm ci --omit=dev)
  ├── Copy dist/ from builder stage
  └── Run: node dist/index.js
```

This means the final image contains no TypeScript compiler, no source files, and no dev dependencies — only what's needed to run the compiled app. The result is roughly 180MB vs 400–500MB+ for a naive single-stage build.

### Image size breakdown

| Layer | Size |
|-------|------|
| node:20-alpine base | ~120MB |
| Production node_modules | ~30MB |
| Compiled dist/ | ~1MB |
| **Total** | **~180MB** |

### Running as part of the full stack

See the root `docker-compose.yml` to run the backend alongside the frontend with a single command.

---

## Authentication

All tokens are stored in **httpOnly cookies** — the frontend never reads the JWT directly.

| Cookie | Lifetime | Purpose |
|--------|----------|---------|
| `access` | 15 min | Authenticates every protected request |
| `refresh` | 24 hours | Used to issue a new access token |

**Flow:**
1. `POST /api/auth/login` → sets both cookies
2. On 401, `POST /api/auth/refresh` → issues a new access token using the refresh cookie
3. `POST /api/auth/logout` → deletes the refresh token from DB and clears both cookies

Refresh tokens are stored in MongoDB with a TTL index — expired tokens are automatically deleted at the database level.

---

## API Reference

All responses follow this shape:

```json
{ "success": true, "data": { ... } }
{ "success": true, "data": [...], "pagination": { "page": 1, "limit": 10, "total": 42, "pages": 5 } }
{ "success": false, "message": "..." }
```

---

### Auth — `/api/auth`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/register` | — | Create account |
| POST | `/login` | — | Login → sets `access` + `refresh` cookies |
| POST | `/refresh` | refresh cookie | Get a new access token |
| POST | `/logout` | ✓ | Delete current refresh token, clear cookies |
| POST | `/logout-all` | ✓ | Delete all refresh tokens (all devices) |

Register and login are rate-limited to **10 requests per 15 minutes** per IP.

**POST /register**
```json
{ "name": "Wasi", "age": 22, "email": "wasi@example.com", "password": "secret123" }
```

**POST /login**
```json
{ "email": "wasi@example.com", "password": "secret123" }
```

---

### Admin — `/api/auth/admin`

All routes require auth + admin role.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/admin` | List all admins (paginated) |
| GET | `/admin/:userid` | Check if a user is an admin |
| POST | `/admin/:userid` | Grant admin role to a user |

---

### Movies — `/api/movie`

Read endpoints are public. Write endpoints require auth + admin role.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | — | List / search movies (paginated) |
| GET | `/:movieid` | — | Full details for one movie |
| GET | `/:movieid/credits` | — | Cast and crew |
| POST | `/` | admin | Add a movie |
| PUT | `/:movieid` | admin | Update a movie |
| DELETE | `/:movieid` | admin | Delete a movie |

`movieid` is the TMDB integer id, not the MongoDB `_id`.

**GET / query params**

| Param | Type | Description |
|-------|------|-------------|
| `name` | string | Full-text search on title |
| `id` | number | Fetch a single movie by TMDB id |
| `page` | number | Default: 1 |
| `limit` | number | Default: 10 |

```
GET /api/movie?name=inception&page=1&limit=10
GET /api/movie?id=27205
```

---

### Users — `/api/user`

All routes require authentication.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | admin | List / search all users (paginated) |
| GET | `/me` | ✓ | Get own profile |
| PUT | `/me` | ✓ | Update name, age, or email |
| PUT | `/me/password` | ✓ | Change password (requires current password) |
| DELETE | `/me` | ✓ | Delete account (cascades to collection + tokens) |
| DELETE | `/:userid` | admin | Delete another user (cannot delete admins) |

Password is never included in any response.

**PUT /me/password**
```json
{ "oldPassword": "current123", "newPassword": "newSecure456" }
```

---

### User Movie Collection — `/api/user/me/movie`

The user id is read from the JWT — users can only access their own collection.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | List collection (filterable, paginated) |
| POST | `/` | Add movie to collection |
| PUT | `/:tmdbId` | Replace all collection entry fields |
| DELETE | `/:tmdbId` | Remove from collection |
| PATCH | `/:tmdbId/watchlist` | Toggle watchlist |
| PATCH | `/:tmdbId/favorites` | Toggle favorites |
| PATCH | `/:tmdbId/watched` | Toggle watched |
| PATCH | `/:tmdbId/rating` | Set rating (0–10) |
| PATCH | `/:tmdbId/review` | Set text review |

**GET / query params**

| Param | Type | Description |
|-------|------|-------------|
| `inFavs` | boolean | Filter by favorites |
| `inWatchlist` | boolean | Filter by watchlist |
| `watched` | boolean | Filter by watched status |
| `tmdbId` | number | Single entry by TMDB id |
| `name` | string | Search by movie title |
| `page` | number | Default: 1 |
| `limit` | number | Default: 10, max: 100 |

**POST /api/user/me/movie** — the movie must already exist in the DB; `(userId, tmdbId)` pair must be unique.
```json
{ "tmdbId": 27205, "inFavs": false, "inWatchlist": true, "watched": false }
```

**PATCH /:tmdbId/rating**
```json
{ "userRating": 8.5 }
```

**PATCH /:tmdbId/review**
```json
{ "userReview": "One of the best films ever made." }
```

---

## Data Models

### User
| Field | Type | Notes |
|-------|------|-------|
| name | String | required |
| age | Number | required |
| email | String | required, unique |
| password | String | bcrypt hashed, never returned |
| createdAt / updatedAt | Date | auto |

### Movie
Mirrors the TMDB detail object. Key fields: `id` (TMDB integer, unique index), `title`, `overview`, `release_date`, `poster_path`, `backdrop_path`, `vote_average`, `genres`, `runtime`, plus budget, revenue, tagline, cast/crew via `MovieCredit`.

### UserMovie
| Field | Type | Notes |
|-------|------|-------|
| userId | ObjectId | ref User |
| tmdbId | Number | ref Movie |
| inFavs | Boolean | default false |
| inWatchlist | Boolean | default false |
| watched | Boolean | default false |
| userRating | Number | 0–10, default 0 |
| userReview | String | default "" |
| createdAt / updatedAt | Date | auto |

Unique compound index on `(userId, tmdbId)`.

### RefreshToken
| Field | Type | Notes |
|-------|------|-------|
| token | String | unique |
| userId | ObjectId | ref User |
| expiresAt | Date | TTL index — auto-deleted |

---

## Database Indexes

| Collection | Index | Type |
|------------|-------|------|
| users | `{ email: 1 }` | unique |
| users | `{ name: "text" }` | text |
| movies | `{ id: 1 }` | unique |
| movies | `{ title: "text" }` | text |
| movies | `{ popularity: -1 }` | standard |
| movies | `{ vote_average: -1 }` | standard |
| usermovies | `{ userId: 1, tmdbId: 1 }` | unique compound |
| refreshtokens | `{ expiresAt: 1 }` | TTL |
| admins | `{ userId: 1 }` | unique |

---

## Error Responses

| Status | Meaning |
|--------|---------|
| 400 | Validation failed — `errors` array included |
| 401 | Missing or invalid token |
| 403 | Authenticated but not authorized |
| 404 | Not found |
| 409 | Conflict (duplicate resource) |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

**Validation error shape:**
```json
{
  "success": false,
  "errors": [
    { "field": "email", "message": "Invalid email" }
  ]
}
```

---

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | 5000 | Server port |
| `MONGO_URI` | Yes | — | MongoDB connection string |
| `JWT_SECRET` | Yes | — | JWT signing secret |
| `CLIENT_URL` | No | http://localhost:5173 | CORS allowed origin |
| `NODE_ENV` | No | development | `development` or `production` |

---

## Scripts

```bash
npm run dev      # hot-reload dev server
npm run build    # compile TypeScript → dist/
npm start        # run dist/
npm run clean    # delete dist/
```

---

## Known Limitations

- **No refresh token rotation** — the same refresh token is reused until logout
- **Orphaned UserMovie docs** — deleting a movie does not cascade-delete collection entries
- **No admin demotion endpoint** — must be done directly in the database
- **Search by title only** — no filtering by genre, year, or rating range

## Planned

- Refresh token rotation (one-time use per token)
- Password reset via email
- Movie search by genre / year / rating range
- Admin demotion endpoint
- Rate limiting on all endpoints (currently only auth)
- OpenAPI / Swagger docs
