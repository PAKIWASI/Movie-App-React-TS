import apiFetch from "./apiFetch";
import type { backendResponse, MovieDetail, MovieCredits } from "../types/Movie";


export const getPopularMovies = async (page = 1, limit = 20): Promise<backendResponse> => {
    try {
        const res = await apiFetch(`movie?page=${page}&limit=${limit}`);
        return res.json();
    } catch (err) {
        console.error("getPopularMovies error:", err);
        throw err;
    }
};

export const searchMovies = async (query: string, page = 1, limit = 20): Promise<backendResponse> => {
    try {
        const res = await apiFetch(`movie?name=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
        return res.json();
    } catch (err) {
        console.error("searchMovies error:", err);
        throw err;
    }
};

export const getMovieDetail = async (tmdbId: number): Promise<{ success: boolean; data: MovieDetail }> => {
    try {
        const res = await apiFetch(`movie/${tmdbId}`);
        return res.json();
    } catch (err) {
        console.error("getMovieDetail error:", err);
        throw err;
    }
};

export const getMovieCredits = async (tmdbId: number): Promise<{ success: boolean; data: MovieCredits }> => {
    try {
        const res = await apiFetch(`movie/${tmdbId}/credits`);
        return res.json();
    } catch (err) {
        console.error("getMovieCredits error:", err);
        throw err;
    }
};
