import { createContext, useContext, useState, useEffect } from "react";
import { apiLogin, apiLogout, getMe } from "../services/userAPI";
import { SESSION_EXPIRED_EVENT } from "../services/apiFetch";
import type { User, UserContextType } from "../types/User";
import { useNavigate } from "react-router-dom";



const UserContext = createContext<UserContextType | null>(null);


export function UserProvider({ children }: { children: React.ReactNode }) 
{
    const [user, setUser]       = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isLoggingOut, setLoggingOut] = useState(false);
    const navigate              = useNavigate();

    // On mount — check if a session already exists.
    // We pass skipRefresh=true so that if there's no cookie, apiFetch returns
    // the raw 401 instead of attempting a refresh. This prevents the regression
    // where a fresh page load with no cookies would:
    //   1. GET /user/me → 401
    //   2. POST /auth/refresh → 401 (no refresh cookie either)
    //   3. Dispatch SESSION_EXPIRED_EVENT
    //   4. Redirect to /login even though the user was never logged in
    useEffect(() => {
        const restore = async () => {
            try {
                const res = await getMe(true); // skipRefresh=true
                setUser(res?.data ?? null);
            } catch {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        restore();
    }, []);

    // SESSION_EXPIRED_EVENT is only dispatched when a refresh fails during normal
    // in-session usage (not on mount). When it fires, the user's session has
    // genuinely died mid-use — clear state and redirect to /login.
    useEffect(() => {
        const handleExpired = () => {
            setUser(null);
            navigate("/login");
        };
        window.addEventListener(SESSION_EXPIRED_EVENT, handleExpired);
        return () => window.removeEventListener(SESSION_EXPIRED_EVENT, handleExpired);
    }, [navigate]);


    const login = async (email: string, password: string) => {
        await apiLogin(email, password);
        const res = await getMe(); // no skipRefresh — we just logged in, cookie is fresh
        setUser(res?.data ?? null);
    };


    const logout = async () => {
        setLoggingOut(true);
        await apiLogout();  // wait for logout to finish server side
        setUser(null);
        navigate("/", { replace: true });   // this doesnot work for protected pages (fix in Protected comp)
        setLoggingOut(false);
    };

    return (
        <UserContext.Provider value={{ 
            user, 
            login, 
            logout, 
            isLoggedIn: !!user, 
            loading,
            isLoggingOut
        }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const ctx = useContext(UserContext);
    if (!ctx) throw new Error("useUser must be used inside <UserProvider>");
    return ctx;
}
