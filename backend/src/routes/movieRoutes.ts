import { Router } from "express";
import { 
    getMovies, 
    getMovieDetails, 
    getMovieCredits, 
    postMovie
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

router.put("/:movieid", 
    authMiddleware,
    validate()          // every field is optional
    updateMovie
);

// router.delete("/:movieid", deleteMovie);

export default router;
