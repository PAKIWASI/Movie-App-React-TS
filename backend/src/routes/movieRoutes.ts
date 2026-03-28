import { Router } from "express";
import { getMovies, getMovieDetails } from "../controllers/movieController";



const router = Router();


// general get rule for movies by popularity (with ?name&page&limit)
// only give general info, not all data
router.get("/", getMovies);

router.get("/:movieid", getMovieDetails);

// router.post("/", postMovie);
//
// router.put("/:movieid", updateMovie);
//
// router.delete("/:movieid", deleteMovie);

export default router;
