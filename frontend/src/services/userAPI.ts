import apiFetch from "./apiFetch";
import type { User } from "../types/User";




export const getMe = async (): Promise<{ success: boolean; data: User }> => {
    const res = await apiFetch("user/me", { method: "GET"});
    return res.json();
};

export const apiLogin = async (email: string, password: string): Promise<void> => {
    const res = await apiFetch("auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
    });
    await res.json(); // consume the body, we don't need the response
};

export const apiLogout = async (): Promise<void> => {
    await apiFetch("auth/logout", { method: "POST" });
};
