import { Router } from "express";
import { PostUserMovieSchema, UpdateUserMovieSchema } from "../types/user_movie.type";
import { validate } from "../middleware/validate";
import { 
    getUserMovies, 
    postUserMovie, 
    updateUserMovie 
} from "../controllers/userMovieController";


const router = Router();

// all routes require user auth after we get roles

// GET /api/user/:id/movie
// get all movies associated with user
// GET /api/user/:id/movie?inFavs=true&inWatchlist=true&watched=false&page=1&limit=10&name=inception
router.get("/",  getUserMovies);    // GET  /api/user/:id/movie
router.post("/", validate(PostUserMovieSchema), postUserMovie);    // POST /api/user/:id/movie

router.put("/:tmdbId", validate(UpdateUserMovieSchema), updateUserMovie);  // PUT  /api/user/:id/movie/:tmdbId
router.delete("/:tmdbId", deleteUserMovie);  // DELETE /api/user/:id/movie/:tmdbId

router.patch("/:tmdbId/watchlist",  validate(UpdateUserMovieSchema), toggleWatchlist);  // PATCH /api/user/:id/movie/:tmdbId/watchlist
router.patch("/:tmdbId/favorites",  validate(UpdateUserMovieSchema),  toggleFavorites);  // PATCH
router.patch("/:tmdbId/watched",    validate(UpdateUserMovieSchema),  toggleWatched);    // PATCH
router.patch("/:tmdbId/rating",     validate(UpdateUserMovieSchema),  setRating);        // PATCH
router.patch("/:tmdbId/review",     validate(UpdateUserMovieSchema),  setReview);        // PATCH
// using patch to toggle watchlist, favlist (put implies whole object changed)

export default router;
