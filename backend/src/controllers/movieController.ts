import { Request, Response } from "express";
import Movie from "../models/Movie";
import { MovieDetails, MovieCredits, CompleteMovieDetail } from "../types/movie.types";

const TMDB_BASE = "https://api.themoviedb.org/3";
const getApiKey = () => process.env.TMDB_API_KEY;

// ─── TMDB Proxy Helpers ────────────────────────────────────────────────────────

const fetchFromTMDB = async <T>(path: string): Promise<T> => {
    const res = await fetch(`${TMDB_BASE}${path}?api_key=${getApiKey()}&language=en-US`);
    if (!res.ok) throw new Error(`TMDB error ${res.status}: ${path}`);
    return res.json() as Promise<T>;
};

// ─── Save / Sync a movie from TMDB into MongoDB ────────────────────────────────

/**
 * POST /api/movies/sync/:tmdbId
 * Fetches full movie detail + credits from TMDB and upserts into DB.
 */
export const syncMovie = async (req: Request, res: Response): Promise<void> => {
    try {
        const { tmdbId } = req.params;

        // Fetch detail and credits in parallel
        const [movieDetail, creditsData] = await Promise.allSettled([
            fetchFromTMDB<MovieDetails>(`/movie/${tmdbId}`),
            fetchFromTMDB<MovieCredits>(`/movie/${tmdbId}/credits`),
        ]);

        if (movieDetail.status === "rejected") {
            res.status(404).json({ success: false, message: "Movie not found on TMDB" });
            return;
        }

        const detail = movieDetail.value;
        const credits = creditsData.status === "fulfilled" ? creditsData.value : null;

        // Upsert by tmdbId so re-syncing updates without duplicates
        const saved = await Movie.findOneAndUpdate(
            { tmdbId: detail.id },
            {
                tmdbId: detail.id,
                adult: detail.adult,
                backdrop_path: detail.backdrop_path,
                genre_ids: detail.genre_ids ?? detail.genres?.map((g) => g.id) ?? [],
                original_language: detail.original_language,
                original_title: detail.original_title,
                overview: detail.overview,
                popularity: detail.popularity,
                poster_path: detail.poster_path,
                release_date: detail.release_date,
                title: detail.title,
                video: detail.video,
                vote_average: detail.vote_average,
                vote_count: detail.vote_count,
                budget: detail.budget,
                homepage: detail.homepage,
                runtime: detail.runtime,
                revenue: detail.revenue,
                tagline: detail.tagline,
                genres: detail.genres,
                production_companies: detail.production_companies,
                spoken_languages: detail.spoken_languages,
                status: detail.status,
                cast: credits?.cast?.slice(0, 20) ?? [],   // top 20 cast
                crew: credits?.crew ?? [],
                savedAt: new Date(),
            },
            { upsert: true, new: true }
        );

        res.status(200).json({ success: true, data: saved });
    } catch (error) {
        console.error("syncMovie error:", error);
        res.status(500).json({ success: false, message: "Failed to sync movie" });
    }
};

// ─── Save movie directly from frontend payload ─────────────────────────────────

/**
 * POST /api/movies
 * Accepts a CompleteMovieDetail body (same shape your frontend already fetches).
 * Lets your frontend push data directly without a second TMDB call.
 */
export const saveMovie = async (req: Request, res: Response): Promise<void> => {
    try {
        const { movieDetail, movieCredits }: CompleteMovieDetail = req.body;

        if (!movieDetail) {
            res.status(400).json({ success: false, message: "movieDetail is required" });
            return;
        }

        const saved = await Movie.findOneAndUpdate(
            { tmdbId: movieDetail.id },
            {
                tmdbId: movieDetail.id,
                adult: movieDetail.adult,
                backdrop_path: movieDetail.backdrop_path,
                genre_ids: movieDetail.genre_ids ?? movieDetail.genres?.map((g) => g.id) ?? [],
                original_language: movieDetail.original_language,
                original_title: movieDetail.original_title,
                overview: movieDetail.overview,
                popularity: movieDetail.popularity,
                poster_path: movieDetail.poster_path,
                release_date: movieDetail.release_date,
                title: movieDetail.title,
                video: movieDetail.video,
                vote_average: movieDetail.vote_average,
                vote_count: movieDetail.vote_count,
                budget: movieDetail.budget,
                homepage: movieDetail.homepage,
                runtime: movieDetail.runtime,
                revenue: movieDetail.revenue,
                tagline: movieDetail.tagline,
                genres: movieDetail.genres,
                production_companies: movieDetail.production_companies,
                spoken_languages: movieDetail.spoken_languages,
                status: movieDetail.status,
                cast: movieCredits?.cast?.slice(0, 20) ?? [],
                crew: movieCredits?.crew ?? [],
                savedAt: new Date(),
            },
            { upsert: true, new: true }
        );

        res.status(200).json({ success: true, data: saved });
    } catch (error) {
        console.error("saveMovie error:", error);
        res.status(500).json({ success: false, message: "Failed to save movie" });
    }
};

// ─── GET all saved movies ──────────────────────────────────────────────────────

/**
 * GET /api/movies
 * Returns all saved movies. Supports ?search=, ?genre=, ?page=, ?limit=
 */
export const getMovies = async (req: Request, res: Response): Promise<void> => {
    try {
        const { search, genre, page = "1", limit = "20" } = req.query;

        const query: Record<string, unknown> = {};

        if (search && typeof search === "string") {
            query.$text = { $search: search };
        }

        if (genre && typeof genre === "string") {
            query["genres.name"] = { $regex: genre, $options: "i" };
        }

        const pageNum = Math.max(1, parseInt(page as string));
        const limitNum = Math.min(100, parseInt(limit as string));
        const skip = (pageNum - 1) * limitNum;

        const [movies, total] = await Promise.all([
            Movie.find(query).skip(skip).limit(limitNum).sort({ savedAt: -1 }),
            Movie.countDocuments(query),
        ]);

        res.status(200).json({
            success: true,
            page: pageNum,
            total_results: total,
            total_pages: Math.ceil(total / limitNum),
            data: movies,
        });
    } catch (error) {
        console.error("getMovies error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch movies" });
    }
};

// ─── GET single saved movie ────────────────────────────────────────────────────

/**
 * GET /api/movies/:tmdbId
 * Returns a single saved movie in CompleteMovieDetail shape (matches frontend type).
 */
export const getMovieById = async (req: Request, res: Response): Promise<void> => {
    try {
        const movie = await Movie.findOne({ tmdbId: Number(req.params.tmdbId) });

        if (!movie) {
            res.status(404).json({ success: false, message: "Movie not found in DB" });
            return;
        }

        // Return in the same CompleteMovieDetail shape the frontend already uses
        const response: CompleteMovieDetail = {
            movieDetail: {
                adult: movie.adult,
                backdrop_path: movie.backdrop_path,
                genre_ids: movie.genre_ids,
                id: movie.tmdbId,
                original_language: movie.original_language,
                original_title: movie.original_title,
                overview: movie.overview,
                popularity: movie.popularity,
                poster_path: movie.poster_path,
                release_date: movie.release_date,
                title: movie.title,
                video: movie.video,
                vote_average: movie.vote_average,
                vote_count: movie.vote_count,
                budget: movie.budget,
                homepage: movie.homepage,
                runtime: movie.runtime,
                revenue: movie.revenue,
                tagline: movie.tagline,
                genres: movie.genres,
                production_companies: movie.production_companies as { id: number; name: string; logo_path: string }[],
                spoken_languages: movie.spoken_languages,
                status: movie.status,
            },
            movieCredits: {
                cast: movie.cast ?? [],
                crew: movie.crew ?? [],
            },
        };

        res.status(200).json({ success: true, data: response });
    } catch (error) {
        console.error("getMovieById error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// ─── DELETE a saved movie ──────────────────────────────────────────────────────

/**
 * DELETE /api/movies/:tmdbId
 */
export const deleteMovie = async (req: Request, res: Response): Promise<void> => {
    try {
        const deleted = await Movie.findOneAndDelete({ tmdbId: Number(req.params.tmdbId) });

        if (!deleted) {
            res.status(404).json({ success: false, message: "Movie not found" });
            return;
        }

        res.status(200).json({ success: true, message: "Movie deleted" });
    } catch (error) {
        console.error("deleteMovie error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// ─── CHECK if movie is saved ───────────────────────────────────────────────────

/**
 * GET /api/movies/:tmdbId/exists
 * Quick check — does this movie exist in DB? Useful for fav/save state on load.
 */
export const movieExists = async (req: Request, res: Response): Promise<void> => {
    try {
        const exists = await Movie.exists({ tmdbId: Number(req.params.tmdbId) });
        res.status(200).json({ success: true, exists: !!exists });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};


