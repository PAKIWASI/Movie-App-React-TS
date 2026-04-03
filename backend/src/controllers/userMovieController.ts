import { Request, Response } from "express";
import mongoose from "mongoose";
import UserMovieModel from "../models/UserMovie";
import MovieModel from "../models/Movie";
import { PostUserMovie, SetRating, SetReview } from "../types/user_movie.type";
import { getPagination, buildPaginationMeta } from "../utils/paginate";
import { sanitizeString } from "../utils/sanitize";


// helper to get composite key { userid, tmdbid }
const getCompositeKey = (req: Request) => ({
    userId: new mongoose.Types.ObjectId(req.userid as string),
    tmdbId: parseInt(req.params.tmdbId as string),
});


// this doesnot check if user exists or not (if we delete user but access token is valid for 15min) - probably fine

// GET /api/user/me/movie?inFavs=true&inWatchlist=true&watched=false&page=1&limit=10&name=inception&tmdbId=123
export const getUserMovies = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = new mongoose.Types.ObjectId(req.userid as string);
        const { page, limit, skip } = getPagination(req);

        const filter: Record<string, any> = { userId };

        if (req.query.inFavs      !== undefined) filter.inFavs      = req.query.inFavs      === "true";
        if (req.query.inWatchlist !== undefined) filter.inWatchlist = req.query.inWatchlist === "true";
        if (req.query.watched     !== undefined) filter.watched     = req.query.watched     === "true";

        if (req.query.tmdbId) {
            filter.tmdbId = Number(req.query.tmdbId);
        }

        const name = sanitizeString(req.query.name);
        if (name) {
            const matchingMovies = await MovieModel.find({ $text: { $search: name } }).select("id");
            const ids = matchingMovies.map(m => m.id);

            if (ids.length === 0) {
                res.status(200).json({
                    success: true,
                    data: [],
                    pagination: buildPaginationMeta(page, limit, 0),
                });
                return;
            }
            filter.tmdbId = { $in: ids };

            /* N+1 query pattern:
                This loads ALL matching movies into memory, then filters
                Could use aggregation with $lookup + $match on text search directly
            */
        }

        const total = await UserMovieModel.countDocuments(filter);

        const pipeline: mongoose.PipelineStage[] = [
            { $match: filter },
            {
                $lookup: {
                    from:         "movies",
                    localField:   "tmdbId",
                    foreignField: "id",
                    as:           "movie"
                }
            },
            { $unwind: "$movie" },
            { $skip: skip },
            { $limit: limit },
            {
                $project: {
                    tmdbId:      1,
                    inFavs:      1,
                    inWatchlist: 1,
                    watched:     1,
                    userRating:  1,
                    userReview:  1,
                    "movie.title":        1,
                    "movie.poster_path":  1,
                    "movie.release_date": 1,
                }
            }
        ];

        const movies = await UserMovieModel.aggregate(pipeline);

        res.status(200).json({
            success: true,
            data: movies,
            pagination: buildPaginationMeta(page, limit, total),
        });

    } catch (error) {
        console.error("getUserMovies Error:", error);
        res.status(500).json({ success: false, message: "Failed to get user movies" });
    }
};


// POST /api/user/me/movie
export const postUserMovie = async (req: Request, res: Response): Promise<void> => {
    try {
        const um: PostUserMovie = req.body;
        const userId = new mongoose.Types.ObjectId(req.userid as string);

        const movie = await MovieModel.exists({ id: um.tmdbId });
        if (!movie) {
            res.status(404).json({ success: false, message: "Movie with tmdbId does not exist in database" });
            return;
        }

        const insertedUM = await UserMovieModel.create({ ...um, userId });
        res.status(201).json({ success: true, data: insertedUM });
    } catch (error: any) {
        console.error("postUserMovie Error: ", error);
        if (error.code === 11000) {
            res.status(409).json({ success: false, message: "UserMovie already exists" });
            return;
        }
        res.status(500).json({ success: false, message: "Failed to Post UserMovie" });
    }
};


// PUT /api/user/me/movie/:tmdbId
export const updateUserMovie = async (req: Request, res: Response): Promise<void> => {
    try {
        const um = await UserMovieModel.findOneAndUpdate(
            getCompositeKey(req),
            req.body,
            { returnDocument: 'after', runValidators: true }
        );

        if (!um) {
            res.status(404).json({ success: false, message: "UserMovie not found" });
            return;
        }

        res.status(200).json({ success: true, data: um });
    } catch (error) {
        console.error("updateUserMovie Error: ", error);
        res.status(500).json({ success: false, message: "Failed to Update UserMovie" });
    }
};


// DELETE /api/user/me/movie/:tmdbId
export const deleteUserMovie = async (req: Request, res: Response): Promise<void> => {
    try {
        const um = await UserMovieModel.findOneAndDelete(getCompositeKey(req));
        if (!um) {
            res.status(404).json({ success: false, message: "UserMovie not found" });
            return;
        }

        res.status(200).json({ success: true, message: "UserMovie deleted" });
    } catch (error) {
        console.error("deleteUserMovie Error: ", error);
        res.status(500).json({ success: false, message: "Failed to Delete UserMovie" });
    }
};


// PATCH /api/user/me/movie/:tmdbId/watchlist
export const toggleWatchlist = async (req: Request, res: Response): Promise<void> => {
    try {
        const um = await UserMovieModel.findOneAndUpdate(
            getCompositeKey(req),
            [{ $set: { inWatchlist: { $not: "$inWatchlist" } } }],
            { returnDocument: "after" , updatePipeline: true }
        );

        if (!um) { res.status(404).json({ success: false, message: "UserMovie not found" }); return; }
        res.status(200).json({ success: true, data: um });
    } catch (error) {
        console.error("toggleWatchlist Error:", error);
        res.status(500).json({ success: false, message: "Failed to toggle watchlist" });
    }
};


// PATCH /api/user/me/movie/:tmdbId/favorites
export const toggleFavorites = async (req: Request, res: Response): Promise<void> => {
    try {
        const um = await UserMovieModel.findOneAndUpdate(
            getCompositeKey(req),
            [{ $set: { inFavs: { $not: "$inFavs" } } }],
            { returnDocument: "after", updatePipeline: true }
        );

        if (!um) { res.status(404).json({ success: false, message: "UserMovie not found" }); return; }
        res.status(200).json({ success: true, data: um });
    } catch (error) {
        console.error("toggleFavorites Error:", error);
        res.status(500).json({ success: false, message: "Failed to toggle favorites" });
    }
};


// PATCH /api/user/me/movie/:tmdbId/watched
export const toggleWatched = async (req: Request, res: Response): Promise<void> => {
    try {
        const um = await UserMovieModel.findOneAndUpdate(
            getCompositeKey(req),
            [{ $set: { watched: { $not: "$watched" } } }],
            { returnDocument: "after", updatePipeline: true }
        );

        if (!um) { res.status(404).json({ success: false, message: "UserMovie not found" }); return; }
        res.status(200).json({ success: true, data: um });
    } catch (error) {
        console.error("toggleWatched Error:", error);
        res.status(500).json({ success: false, message: "Failed to toggle watched" });
    }
};


// PATCH /api/user/me/movie/:tmdbId/rating
export const setRating = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userRating }: SetRating = req.body;         // zod verified
        const um = await UserMovieModel.findOneAndUpdate(
            getCompositeKey(req),
            { $set: { userRating } },
            { returnDocument: "after", runValidators: true }
        );

        if (!um) { res.status(404).json({ success: false, message: "UserMovie not found" }); return; }
        res.status(200).json({ success: true, data: um });
    } catch (error) {
        console.error("setRating Error:", error);
        res.status(500).json({ success: false, message: "Failed to set rating" });
    }
};


// PATCH /api/user/me/movie/:tmdbId/review
export const setReview = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userReview }: SetReview = req.body;
        const um = await UserMovieModel.findOneAndUpdate(
            getCompositeKey(req),
            { $set: { userReview } },
            { returnDocument: "after", runValidators: true }
        );

        if (!um) { res.status(404).json({ success: false, message: "UserMovie not found" }); return; }
        res.status(200).json({ success: true, data: um });
    } catch (error) {
        console.error("setReview Error:", error);
        res.status(500).json({ success: false, message: "Failed to set review" });
    }
};


