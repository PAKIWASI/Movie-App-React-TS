import { Router } from "express";



const router = Router();


// general get rule for movies by popularity (with page limit)
router.get("/", getMovies);

router.get("/:movieid", getMovieByID);


export default router;
