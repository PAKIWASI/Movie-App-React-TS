import { Request, Response } from "express"
import movieModel from "../models/Movie"


const MIN_PAGES = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;


// GET /api/movies?name=Ali&page=1&limit=10
export const getMovies = async (req: Request, res: Response) : Promise<void> => {
    try { 
        const page  = Math.max(MIN_PAGES, parseInt(req.query.page  as string) || MIN_PAGES);
        const limit = Math.min(MAX_LIMIT, parseInt(req.query.limit as string) || DEFAULT_LIMIT); // cap at 100
        const skip  = (page - 1) * limit;

        const filter = req.query.name ? { $text: { $search: req.query.name as string } } : {};

        const [movies, total] = await Promise.all([
            movieModel.find(filter)
                .skip(skip)
                .limit(limit),
            movieModel.countDocuments(filter),
        ]);

        res.status(200).json({
            success: true,
            data: movies,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to get movies" });
    }
};


// GET /api/movies/:id
export const getMovieDetails = async (req: Request, res: Response) : Promise<void> => {
    try {
        const movie = await movieModel.findOne({ id: parseInt(req.params.id as string) });
        if (!movie) {
            res.status(404).json({ success: false, message: "Movie not found" });
            return;
        }

        res.status(200).json({ success: true, data: movie });

    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to get movie" });
    }
};



