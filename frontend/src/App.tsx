import Home from "./pages/Home";
import Login from "./pages/Login";
import Search from "./pages/Search";
import Profile from "./pages/Profile";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import Navbar from "./components/Navbar";
import MovieDetail from "./pages/MovieDetail";
import { useUser } from "./contexts/UserContext";
import { Navigate, Route, Routes } from "react-router-dom";
import { Favorites, Watchlist } from "./pages/PagesCollection";



function App() 
{
    return (
        <>
            <Navbar />
            <main className="px-6 py-6 max-w-7xl mx-auto">
                <Routes>
                    <Route path="/"          element={<Home />} />
                    <Route path="/search"    element={<Search />} />
                    <Route path="/movie/:id" element={<MovieDetail />} />

                    <Route path="/login"     element={<PublicOnly><Login /></PublicOnly>} />
                    <Route path="/register"  element={<PublicOnly><Register /></PublicOnly>} />

                    <Route path="/profile"   element={<Protected><Profile /></Protected>} />
                    <Route path="/favorites" element={<Protected><Favorites /></Protected>} />
                    <Route path="/watchlist" element={<Protected><Watchlist /></Protected>} />

                    <Route path="*" element={<NotFound />} />
                </Routes>
            </main>
        </>
    );
};

export default App;


// Redirect to /login if not authenticated.
// Returns null while the session check is in-flight so we don't flash /login
//  to a user who is actually logged in (cookie present but /me not resolved yet).
//  Redirects to / if user just logged out (and was present in  protected pages)
function Protected({ children }: { children: React.ReactNode }) 
{
    const { isLoggedIn, loading, isLoggingOut } = useUser();

    if (loading)      return null;
    if (isLoggingOut) return <Navigate to="/" replace />;
    if (!isLoggedIn)  return <Navigate to="/login" replace />;

    return <>{children}</>;
};


// Redirect logged-in users away from login/register back to home.
// Also waits for loading so a logged-in user with a slow /me check doesn't
// briefly see the login page before being redirected.
function PublicOnly({ children }: { children: React.ReactNode }) 
{
    const { isLoggedIn, loading } = useUser();

    if (loading)    return null;
    if (isLoggedIn) return <Navigate to="/" replace />;
    return <>{children}</>;
}



/* TODO:
    1. admin portal — pending
    2. home page caching — cache TMDBmovie[] per page number in a Map; invalidate on full reload
    3. form submission errors only show status code — pass the parsed error body from apiFetch
    4. remove arrow keys from age/rating form
*/


