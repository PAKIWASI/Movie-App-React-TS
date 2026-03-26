import express from "express";
import dotenv from "dotenv";       // reads .env file
import cors from "cors";           // allows browser apps to call this API
import connectDB from "./config/db";
import movieRoutes from "./routes/movieRoutes";
import { notFound, errorHandler } from "./middleware/errorHandler";

dotenv.config();   // loads .env into process.env FIRST — order matters
connectDB();       // opens the MongoDB connection before any request hits

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware (runs on every request, in order)
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json());  // parses JSON request bodies into req.body

// Routes — anything hitting /api/movies goes to movieRoutes
app.use("/api/movies", movieRoutes);

// Health check endpoint
app.get("/", (_req, res) => {
    res.json({ message: "Movie API is running" });
});

// Error middleware — must come LAST
app.use(notFound);      // catches requests to unknown routes
app.use(errorHandler);  // catches thrown errors from any route

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
