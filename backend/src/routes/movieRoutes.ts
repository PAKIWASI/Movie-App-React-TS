import { Router } from "express";
import { validate } from "../middleware/validate";
import { MovieDetailsSchema, UpdateMovieSchema } from "../types/movie.type";
import {
    getMovies,
    getMovieDetails,
    getMovieCredits,
    postMovie,
    updateMovie,
    deleteMovie
} from "../controllers/movieController";


const router = Router();


// general get endpoint for movies by popularity (with ?name&page&limit)
// only give general info, not all data
// TODO: add param id and if present, just do a normal lookup for that one movie
router.get("/", getMovies);

// get all data on a single movie
router.get("/:movieid", getMovieDetails);

// get cast and crew credits info for a movie
router.get("/:movieid/credits", getMovieCredits);

router.post("/",
    // authMiddleware,
    validate(MovieDetailsSchema),
    postMovie
);

router.put("/:movieid",
    // authMiddleware,
    validate(UpdateMovieSchema), // every field is optional, can't update id
    updateMovie
);

router.delete("/:movieid",
    // authMiddleware,
    deleteMovie
);

// TODO: once we add roles, then all routes will require authMiddleware
// and then protected routes will additionally require adminAuth

export default router;
