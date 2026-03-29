import { Router } from "express";




const router = Router();


// GET /api/user/:id/movie
// get all movies associated with user
// GET /api/user/:userId/movie?inFavs=true&inWatchlist=true&watched=false&page=1&limit=10&name=inception
router.get("/",                      getUserMovies)    // GET  /api/user/:id/movie
router.post("/",                     postUserMovie)    // POST /api/user/:id/movie

router.get("/:tmdbId",               getUserMovie)     // GET  /api/user/:id/movie/:tmdbId
router.put("/:tmdbId",               updateUserMovie)  // PUT  /api/user/:id/movie/:tmdbId
router.delete("/:tmdbId",            deleteUserMovie)  // DELETE

router.patch("/:tmdbId/watchlist",   toggleWatchlist)  // PATCH /api/user/:id/movie/:tmdbId/watchlist
router.patch("/:tmdbId/favorites",   toggleFavorites)  // PATCH
// using patch to toggle watchlist, favlist (put implies whole object changed)

export default router;
