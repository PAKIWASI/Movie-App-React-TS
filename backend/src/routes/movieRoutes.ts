import { Router } from "express";
import { validate } from "../middleware/validate";
import { adminMiddleware } from "../middleware/adminMiddleware";
import { MovieDetailsSchema, UpdateMovieSchema } from "../types/movie.type";
import { authMiddleware } from "../middleware/authMiddleware";
import {
    getMovies,
    getMovieDetails,
    getMovieCredits,
    postMovie,
    updateMovie,
    deleteMovie
} from "../controllers/movieController";


const router = Router();


// only give general info, not all data
// GET /api/movie?name=movie&id=111&page=1&limit=10
router.get("/", getMovies);

// get all data on a single movie
router.get("/:movieid", getMovieDetails);

// get cast and crew credits info for a movie
router.get("/:movieid/credits", getMovieCredits);

router.post("/",
    authMiddleware,
    adminMiddleware,
    validate(MovieDetailsSchema),   // this can set tmdb id but we need it
    postMovie
);

router.put("/:movieid",
    authMiddleware,
    adminMiddleware,
    validate(UpdateMovieSchema), // every field is optional, can't update id
    updateMovie
);

router.delete("/:movieid",
    authMiddleware,
    adminMiddleware,
    deleteMovie
);

export default router;
