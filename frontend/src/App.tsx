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
*/

export default App;
