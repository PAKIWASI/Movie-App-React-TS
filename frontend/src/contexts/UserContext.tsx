import { createContext, useContext, useState, useEffect } from "react";
import type { User, UserContextType } from "../types/User";
import { apiLogin, apiLogout, getMe } from "../services/userAPI";



const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);  // true until first /me resolves

    // On mount, check if the user already has a valid cookie
    // It runs once when the UserProvider mounts 
    // which happens when your app first loads since UserProvider wraps everything at the root.
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

    const login = async (email: string, password: string) => {
        await apiLogin(email, password);       // sets the cookie
        const res = await getMe();             // fetch the actual user data
        setUser(res.data);
    };

    const logout = async () => {
        await apiLogout();
        setUser(null);
    };

    return (
        <UserContext.Provider value={{ user, login, logout, isLoggedIn: !!user, loading }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const ctx = useContext(UserContext);
    if (!ctx) throw new Error("useUser must be used inside <UserProvider>");
    return ctx;
}

