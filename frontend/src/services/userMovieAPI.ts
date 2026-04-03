import type { CollectionFilters, UserMovie } from "../types/Movie";
import apiFetch from "./apiFetch";


// User movie collection

export const getCollection = async (filters: CollectionFilters = {}): Promise<{
    success: boolean;
    data: UserMovie[];
    pagination: { page: number; limit: number; total: number; pages: number };
}> => {
    const params = new URLSearchParams();           // dynamically make params
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


