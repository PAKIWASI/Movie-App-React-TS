import apiFetch from "./apiFetch";
import type { User } from "../types/User";
import type { UserMovie } from "../types/Movie";


// ── Auth ─────────────────────────────────────────────────────────────────────

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


// ── User profile ──────────────────────────────────────────────────────────────

export const getMe = async (): Promise<{ success: boolean; data: User }> => {
    const res = await apiFetch("user/me");      // TODO: no methid specified. does it default to GET??
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


// ── User movie collection ─────────────────────────────────────────────────────

export interface CollectionFilters {
    inFavs?:      boolean;
    inWatchlist?: boolean;
    watched?:     boolean;
    page?:        number;
    limit?:       number;
}

export const getCollection = async (filters: CollectionFilters = {}): Promise<{
    success: boolean;
    data: UserMovie[];
    pagination: { page: number; limit: number; total: number; pages: number };
}> => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
        if (v !== undefined) params.set(k, String(v));
    });
    const res = await apiFetch(`user/me/movie?${params}`);
    return res.json();
};

export const addToCollection = async (tmdbId: number): Promise<{ success: boolean; data: UserMovie }> => {
    const res = await apiFetch("user/me/movie", {
        method: "POST",
        body: JSON.stringify({ tmdbId }),
    });
    return res.json();
};

export const removeFromCollection = async (tmdbId: number): Promise<void> => {
    await apiFetch(`user/me/movie/${tmdbId}`, { method: "DELETE" });
};

export const toggleFavorite = async (tmdbId: number): Promise<{ success: boolean; data: UserMovie }> => {
    const res = await apiFetch(`user/me/movie/${tmdbId}/favorites`, { method: "PATCH" });
    return res.json();
};

export const toggleWatchlist = async (tmdbId: number): Promise<{ success: boolean; data: UserMovie }> => {
    const res = await apiFetch(`user/me/movie/${tmdbId}/watchlist`, { method: "PATCH" });
    return res.json();
};

export const toggleWatched = async (tmdbId: number): Promise<{ success: boolean; data: UserMovie }> => {
    const res = await apiFetch(`user/me/movie/${tmdbId}/watched`, { method: "PATCH" });
    return res.json();
};

export const setRating = async (tmdbId: number, userRating: number): Promise<{ success: boolean; data: UserMovie }> => {
    const res = await apiFetch(`user/me/movie/${tmdbId}/rating`, {
        method: "PATCH",
        body: JSON.stringify({ userRating }),
    });
    return res.json();
};

export const setReview = async (tmdbId: number, userReview: string): Promise<{ success: boolean; data: UserMovie }> => {
    const res = await apiFetch(`user/me/movie/${tmdbId}/review`, {
        method: "PATCH",
        body: JSON.stringify({ userReview }),
    });
    return res.json();
};

export const getMovieEntry = async (tmdbId: number): Promise<{ success: boolean; data: UserMovie[] }> => {
    const res = await apiFetch(`user/me/movie?tmdbId=${tmdbId}`);
    return res.json();
};
