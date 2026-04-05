# Movie App — Frontend

React + TypeScript frontend for a movie tracking application. Browse movies, search with live suggestions, manage a personal collection (favorites, watchlist, watched), and add ratings and reviews.

---

## Tech Stack

| | |
|---|---|
| **Framework** | React 19 + TypeScript |
| **Build tool** | Vite |
| **Styling** | Tailwind CSS v4 (CSS-first config) |
| **Routing** | React Router v7 |
| **HTTP** | Native `fetch` with a custom wrapper (`apiFetch`) |
| **State** | React Context API — no external libraries |

---

## Project Structure

```
src/
├── components/
│   ├── ui/
│   │   └── Button.tsx          # Shared button (variant: primary | outline | ghost | search)
│   ├── MovieCard.tsx           # Poster card with hover fav/watchlist actions
│   ├── MovieDisplay.tsx        # Responsive grid of MovieCards
│   ├── Navbar.tsx              # Top nav + user dropdown
│   └── SearchBar.tsx           # Search input
├── contexts/
│   ├── UserContext.tsx          # Auth state: user, login, logout, isLoggedIn, loading
│   └── CollectionContext.tsx    # Movie collection with optimistic updates
├── pages/
│   ├── Home.tsx                # Popular movies feed with "Load More"
│   ├── Search.tsx              # Search results (URL-driven via ?q=)
│   ├── MovieDetail.tsx         # Full movie info + user collection actions
│   ├── Profile.tsx             # User profile + watched movie strip
│   ├── PagesCollection.tsx     # Favorites and Watchlist pages (shared component)
│   ├── Login.tsx
│   ├── Register.tsx
│   └── NotFound.tsx
├── services/
│   ├── apiFetch.ts             # Fetch wrapper: auth, 401 refresh, 429 retry
│   ├── movieAPI.ts             # Movie endpoints + LRU detail/credits cache
│   ├── userAPI.ts              # Auth + user profile endpoints
│   └── userMovieAPI.ts         # Collection endpoints
├── types/
│   ├── Movie.ts                # TMDBmovie, MovieDetail, UserMovie, context types
│   ├── User.ts                 # User, UserContextType
│   └── PropTypes.ts            # Component prop types
├── App.tsx                     # Route definitions + Protected / PublicOnly wrappers
├── main.tsx                    # Entry point + provider tree
└── index.css                   # Tailwind theme + custom animations
├── Dockerfile                  # Multi-stage build: Vite → nginx
└── nginx.conf                  # React Router fallback config
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- Backend running (see backend README)

### Setup

```bash
cd frontend
npm install
```

Create `.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

```bash
npm run dev       # dev server at http://localhost:5173
npm run build     # production build → dist/
npm run preview   # preview production build
```

---

## Docker

### Build the image

`VITE_API_URL` must be passed at build time because Vite bakes it directly into the compiled JS bundle. It cannot be injected at runtime.

```bash
docker build \
  --build-arg VITE_API_URL=https://your-backend-url/api \
  -t movie-frontend .
```

### Run the container

```bash
docker run -p 80:80 movie-frontend
```

The app is served by nginx on port 80. Open http://localhost.

### How the Dockerfile works

The frontend uses a **multi-stage build**:

```
Stage 1 — builder (node:20-alpine)
  ├── Install dependencies (npm ci)
  ├── Receive VITE_API_URL as a build argument
  ├── Bake it into the JS bundle as an env var
  └── Run: npm run build → outputs to /app/dist

Stage 2 — production (nginx:alpine)
  ├── Copy dist/ from builder stage
  ├── Copy nginx.conf for React Router support
  └── Serve static files on port 80
```

The final image is tiny — just nginx and the compiled static files. No Node.js, no source code, no build tools.

### Why `VITE_API_URL` is a build arg, not a runtime env var

Vite replaces `import.meta.env.VITE_*` references at **compile time**. By the time the image runs, the value is already hard-coded in the minified JS. This means:

- You need to rebuild the image if the backend URL changes
- You cannot override it with `-e VITE_API_URL=...` at runtime
- For different environments (staging, production), build separate images with different `--build-arg` values

### nginx configuration

`nginx.conf` configures a single rule that makes React Router work correctly:

```nginx
try_files $uri $uri/ /index.html;
```

Without this, navigating directly to `/movie/123` or refreshing on any route other than `/` would return a 404 from nginx. This rule tells nginx to serve the file if it exists, and fall back to `index.html` otherwise — letting React Router handle the path client-side.

### Running as part of the full stack

See the root `docker-compose.yml` to run the frontend alongside the backend with a single command.

---

## Authentication

Tokens are stored in **httpOnly cookies** — the frontend never reads them directly.

**Session restore on mount** — `UserContext` calls `GET /user/me` directly with `credentials: "include"`. A 401 means "not logged in" and is silently ignored. `apiFetch` is deliberately bypassed here so no refresh attempt is made for a guest user (which would incorrectly fire `SESSION_EXPIRED_EVENT` and redirect to `/login`).

**In-session 401** — any `apiFetch` call that gets a 401 automatically calls `POST /auth/refresh` once, deduped across concurrent requests via a singleton promise. On success the original request is retried. On failure `SESSION_EXPIRED_EVENT` is dispatched.

**Session expired** — `UserContext` listens for `SESSION_EXPIRED_EVENT`, clears the user, and redirects to `/login`.

**Logout order** — `logout()` calls `navigate("/", { replace: true })` before `setUser(null)`. This ensures `<Protected>` is unmounted before `isLoggedIn` flips to false, preventing it from firing its own `<Navigate to="/login">` and overwriting the home redirect.

---

## Route Guards

```tsx
<Protected>   // Redirects to /login if not authenticated; waits for loading
<PublicOnly>  // Redirects to / if already authenticated (login, register pages)
```

Both return `null` while `loading` is true to avoid flashing the wrong page during the initial session check.

---

## Collection Context

All collection state lives in `CollectionContext` and is loaded once on login (`limit: 500`). Every page reads from this cache — no per-page fetches.

| Method | Description |
|--------|-------------|
| `getEntry(tmdbId)` | Single movie's collection status |
| `getFiltered(filter)` | All entries matching `inFavs` / `inWatchlist` / `watched` |
| `refreshCollection()` | Force refetch from API |
| `setAttribute(id, field, rating?, review?)` | Toggle fav/watchlist/watched or set rating/review |
| `removeEntry(id)` | Remove from collection |

`setAttribute` and `removeEntry` both use the **optimistic update pattern**: snapshot current state → update UI immediately → make API call → rollback to snapshot on failure.

`MovieCard`, `MovieDetailPage`, `PagesCollection`, and `Profile` all read from the same context, so any change anywhere is reflected everywhere with no extra fetches.

---

## API Services

### `apiFetch.ts`
- Appends `credentials: "include"` and `Content-Type: application/json` to every request
- Retries on **429** only, with exponential backoff (up to 3 attempts, honouring `Retry-After` header)
- On **401**: fires one `POST /auth/refresh` (shared across concurrent requests), then retries the original request
- On refresh failure: dispatches `SESSION_EXPIRED_EVENT` once (deduped), then throws

### `movieAPI.ts`
| Function | Endpoint | Cache |
|----------|----------|-------|
| `getPopularMovies(page, limit)` | `GET /movie?page=&limit=` | ❌ |
| `searchMovies(query, page, limit)` | `GET /movie?name=&page=&limit=` | ❌ |
| `getMovieDetail(tmdbId)` | `GET /movie/:id` | ✅ LRU, 20 items |
| `getMovieCredits(tmdbId)` | `GET /movie/:id/credits` | ✅ LRU, 20 items |

### `userAPI.ts`
| Function | Endpoint |
|----------|----------|
| `apiRegister(name, age, email, password)` | `POST /auth/register` |
| `apiLogin(email, password)` | `POST /auth/login` |
| `apiLogout()` | `POST /auth/logout` |
| `getMe()` | `GET /user/me` |
| `updateMe(fields)` | `PUT /user/me` |
| `deleteMe()` | `DELETE /user/me` |

### `userMovieAPI.ts`
| Function | Endpoint |
|----------|----------|
| `getCollection(filters)` | `GET /user/me/movie` |
| `addToCollection(tmdbId)` | `POST /user/me/movie` |
| `removeFromCollection(tmdbId)` | `DELETE /user/me/movie/:tmdbId` |
| `toggleFavorite(tmdbId)` | `PATCH /user/me/movie/:tmdbId/favorites` |
| `toggleWatchlist(tmdbId)` | `PATCH /user/me/movie/:tmdbId/watchlist` |
| `toggleWatched(tmdbId)` | `PATCH /user/me/movie/:tmdbId/watched` |
| `setRating(tmdbId, rating)` | `PATCH /user/me/movie/:tmdbId/rating` |
| `setReview(tmdbId, review)` | `PATCH /user/me/movie/:tmdbId/review` |

---

## Styling

Tailwind CSS v4 with a CSS-first theme in `index.css`:

```css
@theme {
  --c-primary:    hsl(153, 100%, 50%);   /* neon green */
  --c-background: hsl(232, 33%, 10%);    /* dark navy  */
  --c-card:       hsl(232, 33%, 14%);
  --c-border:     hsl(232, 20%, 22%);
}
```

Custom animations: `fade-in-up`, `glow-pulse`, `accordion-down/up`.

---

## Known Limitations

- No offline support
- Collection pages load up to 500 items with no pagination in the UI
- Movie detail/credits cache is memory-only — cleared on full page reload
- Form validation is HTML5 only; server error messages only show the status code

## Planned

- Infinite scroll on Home and Search
- Live search suggestions with keyboard navigation
- Lazy image loading with blur placeholders
- Unit tests (Vitest + React Testing Library)
- PWA / offline support
