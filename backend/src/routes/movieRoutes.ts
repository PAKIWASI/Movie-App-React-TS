import { Router } from "express";
import { 
    getMovies, 
    getMovieDetails, 
    getMovieCredits 
} from "../controllers/movieController";
import authMiddleware from "../middleware/authMiddleware";
import { validate } from "../middleware/validate";
import { MovieDetailsSchema } from "../types/movie.type";


const router = Router();


// general get rule for movies by popularity (with ?name&page&limit)
// only give general info, not all data
router.get("/", getMovies);

router.get("/:movieid", getMovieDetails);

router.get("/:movieid/credits", getMovieCredits);

router.post("/", 
     authMiddleware, 
     validate(MovieDetailsSchema),
     postMovie
);

// router.put("/:movieid", updateMovie);

// router.delete("/:movieid", deleteMovie);

export default router;
