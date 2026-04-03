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

export const getMe = async (): Promise<{ success: boolean; data: User }> => {
    const res = await apiFetch("user/me");  // no method so GET
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


