import { Router } from "express";
import {
  getMovies,
  getMovieById,
  saveMovie,
  syncMovie,
  deleteMovie,
  movieExists,
} from "../controllers/movieController";

const router = Router();

// GET  /api/movies              — all saved movies (supports ?search= ?genre= ?page= ?limit=)
router.get("/", getMovies);

// GET  /api/movies/:tmdbId      — single movie (returns CompleteMovieDetail shape)
router.get("/:tmdbId", getMovieById);

// GET  /api/movies/:tmdbId/exists — quick saved-state check
router.get("/:tmdbId/exists", movieExists);

// POST /api/movies              — save from frontend payload (CompleteMovieDetail body)
router.post("/", saveMovie);

// POST /api/movies/sync/:tmdbId — fetch from TMDB and save to DB
router.post("/sync/:tmdbId", syncMovie);

// DELETE /api/movies/:tmdbId    — remove a saved movie
router.delete("/:tmdbId", deleteMovie);

export default router;
