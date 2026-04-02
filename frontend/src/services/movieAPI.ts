import apiFetch from "./apiFetch";
import type { backendResponse } from "../types/Movie";

// BUG: getting 404 not found in getMovies()

export const getPopularMovies = async (page = 1, limit = 20): Promise<backendResponse> => {
    try {
        const res = await apiFetch(`movie?page=${page}&limit=${limit}`, {
            method: "GET"
        });
        return res.json();
    } catch (err) {
        console.error("getMovies Error:", err);
        throw err;   // rethrow so the component can handle it
    }
};

export const searchMovies = async (query: string, page = 1): Promise<backendResponse> => {
    try {
        const res = await apiFetch(`movie?name=${encodeURIComponent(query)}&page=${page}`, {
            method: "GET"
        });
        return res.json();
    } catch (err) {
        console.error("searchMovies Error:", err);
        throw err;
    }
};
