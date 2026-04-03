import { Route, Routes, Navigate } from "react-router-dom";
import { useUser } from "./contexts/UserContext";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Search from "./pages/Search";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import MovieDetailPage from "./pages/MovieDetail";
import { Favorites, Watchlist } from "./pages/PagesCollection";


// Redirect to /login if not logged in
function Protected({ children }: { children: React.ReactNode }) {
    const { isLoggedIn, loading } = useUser();
    if (loading) return null;  // wait for the /me check before deciding
    if (!isLoggedIn) return <Navigate to="/login" replace />;
    return <>{children}</>;
}

function App() {
    return (
        <div>
            <Navbar />
            <main className="px-6 py-6 max-w-7xl mx-auto">
                <Routes>
                    <Route path="/"          element={<Home />} />
                    <Route path="/search"    element={<Search />} />
                    <Route path="/movie/:id" element={<MovieDetailPage />} />
                    <Route path="/login"     element={<Login />} />
                    <Route path="/register"  element={<Register />} />

                    <Route path="/profile"   element={<Protected><Profile /></Protected>} />
                    <Route path="/favorites" element={<Protected><Favorites /></Protected>} />
                    <Route path="/watchlist" element={<Protected><Watchlist /></Protected>} />

                    <Route path="*" element={<NotFound />} />
                </Routes>
            </main>
        </div>
    );
}

/* TODO: 
    1. admin portal ? admins can view a lot of stuff from backend
    2.*** if i delete refresh token, all requests fail but frontend still shows logged in. then you have to hit refresh
    3. Each MovieDetail page fetches the user's collection entry for that specific movie individually
        I have made a collectionContext but don't know how would i handle updates locally (if someone adds to favs,
        how does it update locally + async in db)
    4. Every time you navigate to a movie detail page, even one you've already visited,
        it fires fresh GET /api/movie/:id and GET /api/movie/:id/credits calls (no caching) -> in-memory cache or staleTime ??


 Slow Responses — exceeding recommended thresholds
GET /api/movie (list/search) — avg 523ms, peak 1121ms
    This is your worst offender. 20 movies per page is doing a full collection scan every time. The fix is a MongoDB index on whatever field you're sorting by (likely popularity or _id) and making sure pagination uses that index efficiently. Also consider adding an HTTP cache header — these results barely change, so Cache-Control: public, max-age=60 would let the browser serve the 304s without waiting on Mongo at all.
GET /api/user/me/movie (collection queries) — avg 513ms, peak 1029ms
    42 calls total, all slow. This endpoint is hit constantly — per-movie-detail lookups, watchlist fetches, favorites fetches, watched fetches. The (userId, tmdbId) composite index you have in your schema should make these fast, but the numbers suggest it might not be getting used for the filter-based queries (inWatchlist=true, watched=true). Make sure those fields are in a compound index: { userId: 1, inWatchlist: 1 }, { userId: 1, watched: 1 }, { userId: 1, inFavs: 1 }.
GET /api/movie/:id (single movie) — avg 285ms, peak 705ms
    Fetching by tmdbId (the TMDB integer, not _id). If there's no index on the id field, Mongo is doing a full scan every time. Add { id: 1 } unique index on the Movie collection — this alone will likely drop this to under 50ms.
POST /api/user/me/movie — avg 487ms, peak 622ms
    Write operations are slower by nature but 622ms is too high. Likely waiting on the duplicate-check query before inserting. The unique index on (userId, tmdbId) helps here — let Mongo enforce uniqueness via the index rather than doing a findOne check first.
*/


export default App;
