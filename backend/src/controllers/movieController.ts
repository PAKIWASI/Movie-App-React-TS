import { Request, Response } from "express"
import MovieModel from "../models/Movie"
import movieCredit from "../models/MovieCredit";
import { MovieDetail, TMDB_MOVIE_PROJECTION } from "../types/movie.type";


const MIN_PAGES = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

// GET /api/movies?name=movie&id=111&page=1&limit=10
export const getMovies = async (req: Request, res: Response) : Promise<void> => {
    try { 

        // Early return if we have id param, just return that movie
        if (req.query.id) {
            const movie = await MovieModel.findOne({ id: parseInt(req.query.id as string) }).select(TMDB_MOVIE_PROJECTION);
            if (!movie) { 
                res.status(404).json({ success: true, data: movie }); 
                return; 
            }
            res.status(200).json({ success: true, data: [movie] });
            return;
        }

        const page  = Math.max(MIN_PAGES, parseInt(req.query.page  as string) || MIN_PAGES);
        const limit = Math.min(MAX_LIMIT, parseInt(req.query.limit as string) || DEFAULT_LIMIT); // cap at 100
        const skip  = (page - 1) * limit;

        const filter = req.query.name ? { $text: { $search: req.query.name as string } } : {};

        const [movies, total] = await Promise.all([
            MovieModel.find(filter)
                .skip(skip)
                .limit(limit)
                .select(TMDB_MOVIE_PROJECTION), // TODO: maybe do a normal projection ?
            MovieModel.countDocuments(filter),
        ]);

        res.status(200).json({
            success: true,
            data: movies,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Failed to get movies" });
    }
};


// GET /api/movies/:movieid
export const getMovieDetails = async (req: Request, res: Response) : Promise<void> => {
    try {
        const movie = await MovieModel.findOne({ id: parseInt(req.params.movieid as string) });

        if (!movie) {
            res.status(404).json({ success: false, message: "Movie not found" });
            return;
        }

        res.status(200).json({ success: true, data: movie });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Failed to get movie" });
    }
};


// GET /api/movies/:movieid/credits
export const getMovieCredits = async (req: Request, res: Response) : Promise<void> => {
    try {
        const credits = await movieCredit.findOne({ id: parseInt(req.params.movieid as string) });
        if (!credits) {
            res.status(404).json({ success: false, message: "Movie Credits not found" });
            return;
        }

        res.status(200).json({ success: true, data: credits });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Failed to get movie credits" });
    }
};


// POST /api/movies
export const postMovie = async (req: Request, res: Response) : Promise<void> => {
    try {
        const movie: MovieDetail  = req.body;   // zod-validated MovieDetail object
        const insertedMovie = await MovieModel.create(movie);

        res.status(201).json({ success: true, data: insertedMovie });
    } catch (error: any) {
        if (error.code === 11000) {
            res.status(409).json({ success: false, message: "Movie with TMDB ID already exists"})
            return;
        }    
        
        console.error(error);
        res.status(500).json({ success: false, message: "Failed to Post Movie" });
    }
};


// PUT /api/movies/:movieid
export const updateMovie = async (req: Request, res: Response) : Promise<void> => {
    try {
        const movie = await MovieModel.findOneAndUpdate(
            { id: parseInt(req.params.movieid as string) },
            req.body,
            { returnDocument: 'after', runValidators: true }
        );

        if (!movie) {
            res.status(404).json({ success: false, message: "Movie not found" });
            return;
        }

        res.status(200).json({ success: true, data: movie });
    } catch (error) {
        console.error("updateMovie Error: ", error);
        res.status(500).json({ success: false, message: "Failed to Update Movie" });
    }
};


// DELETE /api/movies/:movieid
export const deleteMovie = async (req: Request, res: Response) : Promise<void> => {
    try {
        const result = await MovieModel.deleteOne({ id: parseInt(req.params.movieid as string) });
        if (result.deletedCount === 0) {
            res.status(404).json({ success: false, message: "Movie not found" });
            return;
        }

        res.status(200).json({ success: true, message: "Movie deleted" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Failed to Delete Movie" });
    }
};


