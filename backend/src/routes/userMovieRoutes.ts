import { Router } from "express";
import { validate } from "../middleware/validate";
import { 
    PostUserMovieSchema, 
    SetRatingSchema, 
    SetReviewSchema, 
    UpdateUserMovieSchema 
} from "../types/user_movie.type";
import { 
    deleteUserMovie,
    getUserMovies, 
    postUserMovie, 
    setRating, 
    setReview, 
    toggleFavorites, 
    toggleWatched, 
    toggleWatchlist, 
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

router.patch("/:tmdbId/watchlist",  toggleWatchlist);  // PATCH /api/user/:id/movie/:tmdbId/watchlist
router.patch("/:tmdbId/favorites",  toggleFavorites);  // PATCH
router.patch("/:tmdbId/watched",    toggleWatched);    // PATCH
router.patch("/:tmdbId/rating",     validate(SetRatingSchema), setRating);        // PATCH
router.patch("/:tmdbId/review",     validate(SetReviewSchema), setReview);        // PATCH
// using patch to toggle watchlist, favlist (put implies whole object changed)
// fav, watchlist and watched are just boolean toggles, no schema validation
// rating and review have a body so validate

export default router;
