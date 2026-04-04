# Movie Backend API

A REST API for a movie tracking application. Users can browse movies, maintain a personal collection with watchlists, favorites, ratings, and reviews. Built with Node.js, Express, TypeScript, and MongoDB.

---

## Tech Stack

- **Runtime** — Node.js + TypeScript
- **Framework** — Express
- **Database** — MongoDB via Mongoose
- **Auth** — JWT (access + refresh tokens in httpOnly cookies)
- **Validation** — Zod
- **Password hashing** — bcryptjs
- **Rate Limiting** — express-rate-limit

---

## Project Structure

.
├── config/
│   └── db.ts                    # MongoDB connection setup
├── controllers/
│   ├── adminController.ts       # Admin management (CRUD, role assignment)
│   ├── authController.ts        # Register, login, logout, token refresh
│   ├── movieController.ts       # Movie CRUD operations
│   ├── sql_to_mongoose.md       # SQL to Mongoose reference guide
│   ├── userController.ts        # User profile management
│   └── userMovieController.ts   # Personal movie collection (watchlist, favs, ratings)
├── middleware/
│   ├── adminMiddleware.ts       # Admin role guard
│   ├── authMiddleware.ts        # JWT auth, refresh token, rate limiting
│   ├── errorHandler.ts          # 404 + global error handler
│   └── validate.ts              # Zod validation factory
├── models/
│   ├── Admin.ts                 # Admin role model
│   ├── Movie.ts                 # Movie details model (TMDB data)
│   ├── MovieCredit.ts           # Cast & crew model
│   ├── RefreshToken.ts          # Refresh token storage with TTL
│   ├── User.ts                  # User account model
│   └── UserMovie.ts             # User-movie relationship model
├── routes/
│   ├── authRoutes.ts            # Auth endpoints (register, login, logout, refresh)
│   ├── movieRoutes.ts           # Movie endpoints (public read, admin write)
│   ├── userMovieRoutes.ts       # User's personal movie collection endpoints
│   └── userRoutes.ts            # User profile endpoints
├── types/
│   ├── express.d.ts             # Express type extensions (req.userid, req.role)
│   ├── movie.type.ts            # Zod schemas for TMDB movie data
│   ├── user.type.ts             # Zod schemas for user data
│   └── user_movie.type.ts       # Zod schemas for user-movie collection
├── utils/
│   ├── paginate.ts              # Pagination helpers (page, limit, skip)
│   └── sanitize.ts              # Input sanitization for search queries
├── index.ts                     # Application entry point
└── README.md                    # This file

---

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

### Setup

```bash
git clone <repo-url>
cd <project>
npm install
```

Create a `.env` file in the root:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/moviedb
JWT_SECRET=your-secret-key
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

```bash
npm run dev     # development (ts-node / nodemon)
npm run build   # compile to JS
npm start       # run compiled output
```

Server starts at `http://localhost:5000`.

---

## Authentication

All auth tokens are stored in **httpOnly cookies** — the frontend never touches the JWT directly.

| Cookie | Lifetime | Purpose |
|--------|----------|---------|
| `access` | 15 minutes | Authenticates every protected request |
| `refresh` | 24 hours | Exchanges for a new access token |

**Flow:**
1. `POST /api/auth/login` — sets both cookies
2. On 401, `POST /api/auth/refresh` — issues a new access token using the refresh cookie
3. `POST /api/auth/logout` — clears cookies and deletes the refresh token from DB

Refresh tokens are stored in MongoDB with a TTL index — expired tokens are deleted automatically at the database level.

---

## API Reference

Responses follow a consistent shape:

```json
{ "success": true, "data": { ... } }
{ "success": true, "data": [...], "pagination": { "page": 1, "limit": 10, "total": 42, "pages": 5 } }
{ "success": false, "message": "..." }
```

---

### Auth — `/api/auth`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/register` | — | Create a new user account |
| POST | `/login` | — | Log in, receive access + refresh cookies |
| POST | `/refresh` | refresh cookie | Get a new access token |
| POST | `/logout` | ✓ | Delete current refresh token, clear cookies |
| POST | `/logout-all` | ✓ | Delete all refresh tokens (all devices) |

Register and login are rate-limited to **10 requests per 15 minutes** per IP.

**POST /register**
```json
{
  "name": "Wasi",
  "age": 22,
  "email": "wasi@example.com",
  "password": "secret123"
}
```

**POST /login**
```json
{
  "email": "wasi@example.com",
  "password": "secret123"
}
```

---

### Admin — `/api/auth/admin`

All admin routes require auth + admin role.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/admin` | List all admins (paginated) |
| GET | `/admin/:userid` | Check if a specific user is an admin |
| POST | `/admin/:userid` | Grant admin role to a user |

---

### Movies — `/api/movie`

Read endpoints are public. Write endpoints require auth + admin role.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | — | List/search movies (paginated) |
| GET | `/:movieid` | — | Get full details for one movie |
| GET | `/:movieid/credits` | — | Get cast and crew for a movie |
| POST | `/` | admin | Add a movie |
| PUT | `/:movieid` | admin | Update a movie |
| DELETE | `/:movieid` | admin | Delete a movie |

**GET / query parameters**

| Param | Type | Description |
|-------|------|-------------|
| `name` | string | Full-text search on title |
| `id` | number | Fetch a single movie by TMDB id |
| `page` | number | Page number (default: 1) |
| `limit` | number | Results per page (default: 10) |

```
GET /api/movie?name=inception&page=1&limit=10
GET /api/movie?id=27205
```

`movieid` in path params is the TMDB integer id, not the MongoDB `_id`.

---

### Users — `/api/user`

All user routes require authentication.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | admin | List/search all users (paginated) |
| GET | `/me` | ✓ | Get your own profile |
| PUT | `/me` | ✓ | Update your profile (name, age, email) |
| PUT | `/me/password` | ✓ | Change password (requires current password) |
| DELETE | `/me` | ✓ | Delete your account (cascades to collection + tokens) |
| DELETE | `/:userid` | admin | Delete another user (cannot delete admins) |

**GET / query parameters**

| Param | Type | Description |
|-------|------|-------------|
| `name` | string | Full-text search on name |
| `userid` | string | Fetch a single user by MongoDB id |
| `page` | number | Page number |
| `limit` | number | Results per page |

Password is never returned in any user response.

**PUT /me/password**
```json
{
  "oldPassword": "current123",
  "newPassword": "newSecure456"
}
```

---

### User Movie Collection — `/api/user/me/movie`

A user's personal movie list. Every endpoint reads the user id from the JWT — users can only access their own collection.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | List movies in collection (filterable, paginated) |
| POST | `/` | Add a movie to the collection |
| PUT | `/:tmdbId` | Replace collection entry fields |
| DELETE | `/:tmdbId` | Remove a movie from the collection |
| PATCH | `/:tmdbId/watchlist` | Toggle watchlist status |
| PATCH | `/:tmdbId/favorites` | Toggle favorites status |
| PATCH | `/:tmdbId/watched` | Toggle watched status |
| PATCH | `/:tmdbId/rating` | Set a rating (0–10) |
| PATCH | `/:tmdbId/review` | Set a text review |

**GET / query parameters**

| Param | Type | Description |
|-------|------|-------------|
| `inFavs` | boolean | Filter by favorites |
| `inWatchlist` | boolean | Filter by watchlist |
| `watched` | boolean | Filter by watched status |
| `tmdbId` | number | Fetch a specific movie entry |
| `name` | string | Search by movie title |
| `page` | number | Page number (default: 1) |
| `limit` | number | Results per page (default: 10, max: 100) |

```
GET /api/user/me/movie?inFavs=true&watched=false&page=1&limit=20
GET /api/user/me/movie?name=inception
GET /api/user/me/movie?tmdbId=27205
```

**POST /api/user/me/movie**
```json
{
  "tmdbId": 27205,
  "inFavs": false,
  "inWatchlist": true,
  "watched": false
}
```
The movie must already exist in the database. Each (user, movie) pair is unique.

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
| createdAt | Date | timestamps enabled |
| updatedAt | Date | timestamps enabled |

### Movie
Mirrors the TMDB movie detail object. Key fields: `id` (TMDB integer, unique), `title`, `overview`, `release_date`, `poster_path`, `vote_average`, `genres`, `runtime`.

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
| createdAt | Date | timestamps enabled |
| updatedAt | Date | timestamps enabled |

Composite unique index on `(userId, tmdbId)`.

### Admin
| Field | Type | Notes |
|-------|------|-------|
| userId | ObjectId | unique, ref User |
| addedBy | ObjectId | who granted the role |
| createdAt | Date | timestamps enabled |
| updatedAt | Date | timestamps enabled |

Role is embedded in the access token on login. Token refresh re-fetches the role from the database.

### RefreshToken
| Field | Type | Notes |
|-------|------|-------|
| token | String | unique, the encoded JWT |
| userId | ObjectId | ref User |
| expiresAt | Date | TTL index auto-deletes expired tokens |
| createdAt | Date | timestamps enabled |
| updatedAt | Date | timestamps enabled |

---

## Error Responses

| Status | Meaning |
|--------|---------|
| 400 | Validation failed — `errors` array included |
| 401 | Missing or invalid token |
| 403 | Authenticated but not authorized (e.g. non-admin on admin route) |
| 404 | Resource not found |
| 409 | Conflict — duplicate resource |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

**Validation error example:**
```json
{
  "success": false,
  "errors": [
    { "field": "email", "message": "Invalid email" },
    { "field": "password", "message": "String must contain at least 8 character(s)" }
  ]
}
```

---

## Database Indexes

For performance optimization, the following indexes are in place:

| Collection | Index | Type |
|------------|-------|------|
| users | `{ email: 1 }` | unique |
| users | `{ name: "text" }` | text |
| movies | `{ id: 1 }` | unique |
| movies | `{ title: "text" }` | text |
| movies | `{ popularity: -1 }` | standard |
| movies | `{ vote_average: -1 }` | standard |
| usermovies | `{ userId: 1, tmdbId: 1 }` | unique compound |
| refreshtokens | `{ expiresAt: 1 }` | TTL (auto-delete) |
| admins | `{ userId: 1 }` | unique |

---

## Known Limitations & Future Improvements

### Current Limitations
- **No refresh token rotation** — the same refresh token is reused until logout
- **Orphaned UserMovie docs** — deleting a movie does not cascade-delete user collection entries
- **No admin demotion endpoint** — admins can only be removed directly from the database
- **Limited search** — movie search only supports text search on title, not by genre/year

### Planned Improvements
- [ ] Refresh token rotation on each use
- [ ] Password reset flow (forgot password)
- [ ] Bulk operations (add multiple movies to watchlist)
- [ ] Movie search by genre, release year, rating range
- [ ] Admin demotion endpoint
- [ ] Rate limiting on all endpoints (not just auth)
- [ ] OpenAPI/Swagger documentation

---

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | 5000 | Server port |
| `MONGO_URI` | Yes | — | MongoDB connection string |
| `JWT_SECRET` | Yes | — | Secret key for JWT signing |
| `CLIENT_URL` | No | http://localhost:5173 | CORS allowed origin |
| `NODE_ENV` | No | development | Environment (development/production) |

---

## Scripts

```bash
npm run dev      # Start development server with hot reload
npm run build    # Compile TypeScript to dist/
npm start        # Run compiled JavaScript from dist/
npm run clean    # Remove dist/ directory
```

---

## License

ISC
