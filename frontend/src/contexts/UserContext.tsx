import { createContext, useContext, useState, useEffect } from "react";
import type { User, UserContextType } from "../types/User";
import { apiLogin, apiLogout, getMe } from "../services/userAPI";
import { SESSION_EXPIRED_EVENT } from "../services/apiFetch";
import { useNavigate } from "react-router-dom";



const UserContext = createContext<UserContextType | null>(null);


export function UserProvider({ children }: { children: React.ReactNode }) 
{
    const [user, setUser]     = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // On mount — restore session from cookie
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await getMe();
                setUser(res.data);
            } catch {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    // if the refresh token is deleted server-side while the user is
    // still browsing, the next API call gets a 401, the refresh attempt fails,
    // and apiFetch dispatches SESSION_EXPIRED_EVENT. We listen here and clear
    // the user so the UI immediately reflects the logged-out state instead of
    // staying "logged in" with every request silently failing.
    useEffect(() => {
        const handleExpired = () => setUser(null);
        window.addEventListener(SESSION_EXPIRED_EVENT, handleExpired);
        return () => window.removeEventListener(SESSION_EXPIRED_EVENT, handleExpired);
    }, []);

    const login = async (email: string, password: string) => {
        await apiLogin(email, password);
        const res = await getMe();
        setUser(res.data);
    };

    const logout = async () => {
        await apiLogout();
        setUser(null);
        navigate("/");  // TODO: is this right here?
    };

    return (
        <UserContext.Provider value={{ 
            user, 
            login, 
            logout, 
            isLoggedIn: !!user, 
            loading 
        }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() 
{
    const ctx = useContext(UserContext);
    if (!ctx) throw new Error("useUser must be used inside <UserProvider>");
    return ctx;
}
