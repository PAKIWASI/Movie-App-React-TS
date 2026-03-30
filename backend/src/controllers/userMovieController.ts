import { Request, Response } from "express";
import mongoose from "mongoose";
import UserMovieModel from "../models/UserMovie";
import MovieModel from "../models/Movie";
import { PostUserMovie, SetRating, SetReview } from "../types/user_movie.type";


// TODO: understand how filtering, aggregate works here


// helper — shared logic for getting userId and tmdbId from params
const getCompositeKey = (req: Request) => ({
    // jwt token
    userId: new mongoose.Types.ObjectId((req as any).userid as string),
    tmdbId: parseInt(req.params.tmdbId as string),
});


const MIN_PAGES = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

// GET /api/user/me/movie?inFavs=true&inWatchlist=true&watched=false&page=1&limit=10&name=inception
export const getUserMovies = async (req: Request, res: Response): Promise<void> => {
    try {
        // cast to correct mongoose type                    // jwt auth middlware sets this
        const userId = new mongoose.Types.ObjectId((req as any).userid as string);

        // pagination
        const page  = Math.max(MIN_PAGES, parseInt(req.query.page  as string) || MIN_PAGES);
        const limit = Math.min(MAX_LIMIT, parseInt(req.query.limit as string) || DEFAULT_LIMIT);
        const skip  = (page - 1) * limit;

        // build filter dynamically — only add fields that were actually passed
        const filter: Record<string, any> = { userId }; // key is string, value is any

        if (req.query.inFavs !== undefined)      filter.inFavs = req.query.inFavs === "true";
        if (req.query.inWatchlist !== undefined) filter.inWatchlist = req.query.inWatchlist === "true";
        if (req.query.watched !== undefined)     filter.watched = req.query.watched === "true";

        const pipeline: mongoose.PipelineStage[] = [
            { $match: filter },             // first apply filter to reduce docs
            {
                $lookup: {
                    from:         "movies", // the other collection to join
                    localField:   "tmdbId", // name in current doc
                    foreignField: "id",     // name in other collection
                    as:           "movie",  // name of new field to attach result to
                }
            },
            { $unwind: "$movie" },      // it's an array, unwraps it into a single object
        ];

        if (req.query.name) {
            const matchingMovies = await MovieModel
                .find({ $text: { $search: req.query.name as string } })
                .select("id");
            const ids = matchingMovies.map(m => m.id);
            filter.tmdbId = { $in: ids };  // add to initial $match instead
        }

        // get total before slicing for pagination metadata
        const countPipeline = [...pipeline, { $count: "total" }];
        const countResult = await UserMovieModel.aggregate(countPipeline);
        const total = countResult[0]?.total ?? 0;

        // now add pagination and projection
        pipeline.push(
            { $skip: skip },
            { $limit: limit },
            {
                $project: {     // like SELECT
                    tmdbId: 1,
                    inFavs: 1,
                    inWatchlist: 1,
                    watched: 1,
                    userRating: 1,
                    userReview: 1,
                    "movie.title": 1,
                    "movie.poster_path": 1,
                    "movie.release_date": 1,
                    // other fields that may be used to render a frontend
                }
            }
        );

        const um = await UserMovieModel.aggregate(pipeline);

        res.status(200).json({
            success: true,
            data: um,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) }
        });

    } catch (error) {
        console.error("getUserMovies Error: ", error);
        res.status(500).json({ success: false, message: "Failed to get user movies" });
    }
};

// POST /api/user/me/movie
export const postUserMovie = async (req: Request, res: Response) : Promise<void> => {
    try {
        const um: PostUserMovie = req.body; // this type doesnot have userId
        const userId = new mongoose.Types.ObjectId((req as any).userid as string);

        // check if tmdbId exists in out database or not
        const movie = await MovieModel.exists({ id: um.tmdbId });
        if (!movie) {
            res.status(404).json({ success: false, message: "Movie with tmdbid doesnot exist in database" });
            return;
        }

        const insertedUM = await UserMovieModel.create({...um,  userId });  // throws on error
        res.status(201).json({ success: true , data: insertedUM });
    } catch (error: any) {
        console.error("postUserMovie Error: ", error);
        // Duplicate (MongoDB error code 11000)
        if (error.code === 11000) {
            res.status(409).json({ success: false, message: "UserMovie already exists" });
            return;
        }
        res.status(500).json({ success: false, message: "Failed to Post UserMovie" });
    }
};

// PUT  /api/user/me/movie/:tmdbId
export const updateUserMovie = async (req: Request, res: Response) : Promise<void> => {
    try {
        const um = await UserMovieModel.findOneAndUpdate(
            getCompositeKey(req),     // search by composite key
            req.body,
            { returnDocument: 'after', runValidators: true }
        );

        if (!um) {
            res.status(404).json({ success: false, message: "UserMovie not found" });
            return;
        }

        res.status(200).json({ success: true, data: um });
    } catch (error) {
        console.error("updateMovie Error: ", error);
        res.status(500).json({ success: false, message: "Failed to Update UserMovie" });
    }
};

// DELETE /api/user/me/movie/:tmdbId
export const deleteUserMovie = async (req: Request, res: Response) : Promise<void> => {
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

        if (!um) {
            res.status(404).json({ success: false, message: "UserMovie not found" });
            return;
        }

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
        if (!um) {
            res.status(404).json({ success: false, message: "UserMovie not found" });
            return;
        }
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
        if (!um) {
            res.status(404).json({ success: false, message: "UserMovie not found" });
            return;
        }
        res.status(200).json({ success: true, data: um });
    } catch (error) {
        console.error("toggleWatched Error:", error);
        res.status(500).json({ success: false, message: "Failed to toggle watched" });
    }
};


// PATCH /api/user/me/movie/:tmdbId/rating
export const setRating = async (req: Request, res: Response): Promise<void> => {
    try {
        const key = getCompositeKey(req);
        const { userRating }: SetRating = req.body;

        const um = await UserMovieModel.findOneAndUpdate(
            key,
            { $set: { userRating } },
            { returnDocument: "after", runValidators: true }
        );
        if (!um) {
            res.status(404).json({ success: false, message: "UserMovie not found" });
            return;
        }

        res.status(200).json({ success: true, data: um });
    } catch (error) {
        console.error("setRating Error:", error);
        res.status(500).json({ success: false, message: "Failed to set rating" });
    }
};


// PATCH /api/user/me/movie/:tmdbId/review
export const setReview = async (req: Request, res: Response): Promise<void> => {
    try {
        const key = getCompositeKey(req);
        const { userReview }: SetReview = req.body;

        const um = await UserMovieModel.findOneAndUpdate(
            key,
            { $set: { userReview } },
            { returnDocument: "after", runValidators: true }
        );
        if (!um) {
            res.status(404).json({ success: false, message: "UserMovie not found" });
            return;
        }

        res.status(200).json({ success: true, data: um });
    } catch (error) {
        console.error("setReview Error:", error);
        res.status(500).json({ success: false, message: "Failed to set review" });
    }
};


