import { Request, Response } from "express"
import MovieModel from "../models/Movie"
import movieCredit from "../models/MovieCredit";
import { MovieDetail, TMDB_MOVIE_PROJECTION } from "../types/movie.type";
import { getPagination, buildPaginationMeta } from "../utils/paginate";
import { sanitizeString } from "../utils/sanitize";


// GET /api/movie?name=movie&id=111&page=1&limit=10
export const getMovies = async (req: Request, res: Response): Promise<void> => {
    try {

        // Early return — id param means fetch a single movie
        if (req.query.id) {
            return await getMovieById(req, res);    // TODO: is this right?
        }

        const { page, limit, skip } = getPagination(req);
        const name = sanitizeString(req.query.name);

        const { movies, total } = await MovieModel.search(name, skip, limit, TMDB_MOVIE_PROJECTION);

        res.status(200).json({
            success: true,
            data: movies,
            pagination: buildPaginationMeta(page, limit, total),
        });

    } catch (error) {
        console.error("getMovies Error: ", error);
        res.status(500).json({ success: false, message: "Failed to get movies" });
    }
};


// get movie summery (not details) with an ID
// called by upper function
const getMovieById = async (req: Request, res: Response): Promise<void> => {
    const movie = await MovieModel
        .findByTmdbId(parseInt(req.query.id as string))
        .select(TMDB_MOVIE_PROJECTION);

    if (!movie) {
        res.status(404).json({ success: false, message: "Movie not found" });
        return;
    }

    res.status(200).json({ success: true, data: [movie] });
};


// GET /api/movie/:movieid
export const getMovieDetails = async (req: Request, res: Response): Promise<void> => {
    try {
        const movie = await MovieModel.findByTmdbId(parseInt(req.params.movieid as string));
        if (!movie) {
            res.status(404).json({ success: false, message: "Movie not found" });
            return;
        }

        res.status(200).json({ success: true, data: movie });
    } catch (error) {
        console.error("getMovieDetails Error: ", error);
        res.status(500).json({ success: false, message: "Failed to get movie" });
    }
};


// GET /api/movie/:movieid/credits
export const getMovieCredits = async (req: Request, res: Response): Promise<void> => {
    try {
        const credits = await movieCredit.findOne({ id: parseInt(req.params.movieid as string) });
        if (!credits) {
            res.status(404).json({ success: false, message: "Movie Credits not found" });
            return;
        }

        res.status(200).json({ success: true, data: credits });
    } catch (error) {
        console.error("getMovieCredits Error: ", error);
        res.status(500).json({ success: false, message: "Failed to get movie credits" });
    }
};


// POST /api/movie
export const postMovie = async (req: Request, res: Response): Promise<void> => {
    try {
        const movie: MovieDetail = req.body;
        const insertedMovie = await MovieModel.create(movie);

        res.status(201).json({ success: true, data: insertedMovie });
    } catch (error: any) {
        if (error.code === 11000) {
            res.status(409).json({ success: false, message: "Movie with TMDB ID already exists" });
            return;
        }
        console.error("postMovie Error: ", error);
        res.status(500).json({ success: false, message: "Failed to Post Movie" });
    }
};


// PUT /api/movie/:movieid
export const updateMovie = async (req: Request, res: Response): Promise<void> => {
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

// TODO: if we delete the movie but it is referenced in a userMovie entry? 
// should we do a cascade delete or let it slide ?
// we can show the user that the movie they referenced is no longer in database

// DELETE /api/movie/:movieid
export const deleteMovie = async (req: Request, res: Response): Promise<void> => {
    try {
        const result = await MovieModel.deleteOne({ id: parseInt(req.params.movieid as string) });
        if (result.deletedCount === 0) {
            res.status(404).json({ success: false, message: "Movie not found" });
            return;
        }

        // await UserMovieModel.deleteMany({ tmdbId }); // cascade

        res.status(200).json({ success: true, message: "Movie deleted" });
    } catch (error) {
        console.error("deleteMovie Error: ", error);
        res.status(500).json({ success: false, message: "Failed to Delete Movie" });
    }
};
