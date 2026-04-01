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

// These routes get userid from the token (set as req.userid)

// Only the user (via jwt token) can access their movie collection

// get all movies associated with user
// GET /api/user/me/movie?inFavs=true&inWatchlist=true&watched=false&page=1&limit=10&name=inception&tmdbId
router.get("/",  getUserMovies);

// POST /api/user/me/movie
router.post("/", validate(PostUserMovieSchema), postUserMovie);    

// PUT  /api/user/me/movie/:tmdbId
router.put("/:tmdbId", validate(UpdateUserMovieSchema), updateUserMovie);  

// DELETE /api/user/me/movie/:tmdbId
router.delete("/:tmdbId", deleteUserMovie);  

// PATCH /api/user/me/movie/:tmdbId/watchlist
router.patch("/:tmdbId/watchlist", toggleWatchlist);
router.patch("/:tmdbId/favorites", toggleFavorites);
router.patch("/:tmdbId/watched",   toggleWatched);
router.patch("/:tmdbId/rating",    validate(SetRatingSchema), setRating);
router.patch("/:tmdbId/review",    validate(SetReviewSchema), setReview);
// using patch to toggle watchlist, favlist (put implies whole object changed)
// fav, watchlist and watched are just boolean toggles, no schema validation
// rating and review have a body so validate

export default router;
