import { Router } from "express";
import { getUserMovies } from "../controllers/userMovieController";


const router = Router();

// all routes require user auth after we get roles

// GET /api/user/:id/movie
// get all movies associated with user
// GET /api/user/:userId/movie?inFavs=true&inWatchlist=true&watched=false&page=1&limit=10&name=inception
router.get("/",                     getUserMovies);    // GET  /api/user/:id/movie
router.post("/",                    postUserMovie);    // POST /api/user/:id/movie

router.put("/:tmdbId",              updateUserMovie);  // PUT  /api/user/:id/movie/:tmdbId
router.delete("/:tmdbId",           deleteUserMovie);  // DELETE

router.patch("/:tmdbId/watchlist",  toggleWatchlist);  // PATCH /api/user/:id/movie/:tmdbId/watchlist
router.patch("/:tmdbId/favorites",  toggleFavorites);  // PATCH
router.patch("/:tmdbId/watched",    toggleWatched);    // PATCH
router.patch("/:tmdbId/rating",     setRating);        // PATCH
router.patch("/:tmdbId/review",     setReview);        // PATCH
// using patch to toggle watchlist, favlist (put implies whole object changed)

export default router;
