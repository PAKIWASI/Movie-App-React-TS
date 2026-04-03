import Home from "./pages/Home";
import { useEffect } from "react";
import Login from "./pages/Login";
import Search from "./pages/Search";
import Profile from "./pages/Profile";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import Navbar from "./components/Navbar";
import MovieDetail from "./pages/MovieDetail";
import { useUser } from "./contexts/UserContext";
import { SESSION_EXPIRED_EVENT } from "./services/apiFetch";
import { Favorites, Watchlist } from "./pages/PagesCollection";
import { Route, Routes, Navigate, useNavigate } from "react-router-dom";


// routes for logged in users only
function Protected({ children }: { children: React.ReactNode }) 
{
    const { isLoggedIn, loading } = useUser();
    if (loading) return null;  // wait for the /me check before deciding
    if (!isLoggedIn) return <Navigate to="/login" replace />;
    return <>{children}</>;
}

function App() 
{
    const navigate = useNavigate();

    // When apiFetch detects the refresh token is dead it fires SESSION_EXPIRED_EVENT
    // UserContext has its own listener that already clears user state
    // We only need to redirect here 
    useEffect(() => {
        const handleSessionExpired = () => {
            navigate("/login", { replace: true });
        };

        window.addEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
        return () => window.removeEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
    }, [navigate]);

    return (
        <div>
            <Navbar />
            <main className="px-6 py-6 max-w-7xl mx-auto">
                <Routes>
                    <Route path="/"          element={<Home />} />
                    <Route path="/search"    element={<Search />} />
                    <Route path="/movie/:id" element={<MovieDetail />} />
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
    1. add home page caching?? how
    1. admin portal — pending
    2. Search suggestions — pending
    2. Session expiry redirect — FIXED: added redirect to login on SESSION_EXPIRED_EVENT
    3. CollectionContext optimistic update — FIXED: setAttribute now properly applies updates
    4. Movie detail caching — FIXED: added LRU cache with size limit
    5. Home page caching — Consider implementing React Query or similar for full cache management
    6. Search suggestions — pending (new feature)

Regressions:
    1. if i pre maturily delete the refresh token, but it's still there in the db, i should just get an access token back
        but the problem is we have no way of knowing if token is the same one, we deleted it and we support multiple
        tokens per user for the sake of multiple devices - so it's OK?

*/


export default App;
