import { Request, Response } from "express";
import mongoose from "mongoose";
import userMovie from "../models/UserMovie"
import { PostUserMovie, UpdateUserMovie } from "../types/user_movie.type";



const MIN_PAGES = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

// GET /api/user/:id/movie?inFavs=true&inWatchlist=true&watched=false&page=1&limit=10&name=inception
export const getUserMovies = async (req: Request, res: Response): Promise<void> => {
    try {
        // cast to correct mongoose type
        const userId = new mongoose.Types.ObjectId(req.params.id as string);    

        // pagination
        const page  = Math.max(MIN_PAGES, parseInt(req.query.page  as string) || MIN_PAGES);
        const limit = Math.min(MAX_LIMIT, parseInt(req.query.limit as string) || DEFAULT_LIMIT);
        const skip  = (page - 1) * limit;

        // build filter dynamically — only add fields that were actually passed
        const filter: Record<string, any> = { userId };

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

        // name search — filter by movie title after the join
        if (req.query.name) {
            pipeline.push({ $match: { "movie.title": { $regex: req.query.name as string, $options: "i" } } });
        }

        // get total before slicing for pagination metadata
        const countPipeline = [...pipeline, { $count: "total" }];
        const countResult = await userMovie.aggregate(countPipeline);
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
                    // TODO: other fields that may be used to render a frontend
                }
            }
        );

        const um = await userMovie.aggregate(pipeline);

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

// POST /api/user/:id/movie
export const postUserMovie = async(req: Request, res: Response) : Promise<void> => {
    try {
        // this type doesnot have userId
        const um: PostUserMovie = req.body;
        const userId = new mongoose.Types.ObjectId(req.params.id as string);    

        const insertedUM = userMovie.create({...um,  userId });

        res.status(201).json({ success: true });    // dont return anything back?

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
