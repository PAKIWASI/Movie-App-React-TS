import apiFetch from "./apiFetch";
import type { backendResponse, MovieDetail, MovieCredits } from "../types/Movie";


// Cache configuration
const MAX_CACHE_SIZE = 20;  // Limit cached movies to prevent memory bloat

// In-memory cache for movie detail and credits.
// Movie data is immutable for a given tmdbId — the poster, title, cast etc.
// never change between page visits. So we cache after the first fetch.
// Cache lives for the browser session (cleared on full page reload).
const detailCache = new Map<number, MovieDetail>();
const creditsCache = new Map<number, MovieCredits>();

// Add LRU-like behavior by tracking access order
const detailAccessOrder: number[] = [];
const creditsAccessOrder: number[] = [];

// TODO: in retrospect, this is beyond retarded. do something else
const addToCache = <T>(cache: Map<number, T>, accessOrder: number[], key: number, value: T, maxSize: number) => {
    // Remove oldest if at limit
    if (cache.size >= maxSize) {
        const oldest = accessOrder.shift();
        if (oldest !== undefined) {
            cache.delete(oldest);
        }
    }
    
    // Update access order
    const index = accessOrder.indexOf(key);
    if (index !== -1) accessOrder.splice(index, 1);
    accessOrder.push(key);
    
    cache.set(key, value);
};

const getFromCache = <T>(cache: Map<number, T>, accessOrder: number[], key: number): T | undefined => {
    const value = cache.get(key);
    if (value !== undefined) {
        // Update access order (LRU)
        const index = accessOrder.indexOf(key);
        if (index !== -1) accessOrder.splice(index, 1);
        accessOrder.push(key);
    }
    return value;
};

export const getPopularMovies = async (page = 1, limit = 20): Promise<backendResponse> => {
    const res = await apiFetch(`movie?page=${page}&limit=${limit}`);
    return res.json();
};

export const searchMovies = async (query: string, page = 1, limit = 20): Promise<backendResponse> => {
    const res = await apiFetch(`movie?name=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
    return res.json();
};

export const getMovieDetail = async (tmdbId: number): Promise<{ success: boolean; data: MovieDetail }> => {
    const cached = getFromCache(detailCache, detailAccessOrder, tmdbId);
    if (cached) return { success: true, data: cached };

    const res = await apiFetch(`movie/${tmdbId}`);
    const json: { success: boolean; data: MovieDetail } = await res.json();
    if (json.success) {
        addToCache(detailCache, detailAccessOrder, tmdbId, json.data, MAX_CACHE_SIZE);
    }
    return json;
};

export const getMovieCredits = async (tmdbId: number): Promise<{ success: boolean; data: MovieCredits }> => {
    const cached = getFromCache(creditsCache, creditsAccessOrder, tmdbId);
    if (cached) return { success: true, data: cached };

    const res = await apiFetch(`movie/${tmdbId}/credits`);
    const json: { success: boolean; data: MovieCredits } = await res.json();
    if (json.success) {
        addToCache(creditsCache, creditsAccessOrder, tmdbId, json.data, MAX_CACHE_SIZE);
    }
    return json;
};

