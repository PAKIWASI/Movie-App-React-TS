import apiFetch from "./apiFetch";
import type { User } from "../types/User";



// Auth

export const apiRegister = async (
    name: string, age: number, email: string, password: string
): Promise<void> => {
    const res = await apiFetch("auth/register", {
        method: "POST",
        body: JSON.stringify({ name, age, email, password }),
    });
    await res.json();
};

export const apiLogin = async (email: string, password: string): Promise<void> => {
    const res = await apiFetch("auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
    });
    await res.json();
};

export const apiLogout = async (): Promise<void> => {
    await apiFetch("auth/logout", { method: "POST" });
};


// User profile

// skipRefresh: true — on mount we call this to check if a session exists.
// If there's no cookie, we get a 401 and treat it as "not logged in".
// We must NOT attempt a refresh here and must NOT dispatch SESSION_EXPIRED_EVENT,
// because that would redirect a freshly-loaded logged-out user to /login.
export const getMe = async (skipRefresh = false): Promise<{ success: boolean; data: User } | null> => {
    const res = await apiFetch("user/me", { skipRefresh });
    if (res.status === 401) return null;   // not logged in — caller handles this
    return res.json();
};

export const updateMe = async (
    fields: Partial<Pick<User, "name" | "email" | "age">>
): Promise<{ success: boolean; data: User }> => {
    const res = await apiFetch("user/me", {
        method: "PUT",
        body: JSON.stringify(fields),
    });
    return res.json();
};

export const deleteMe = async (): Promise<void> => {
    await apiFetch("user/me", { method: "DELETE" });
};


