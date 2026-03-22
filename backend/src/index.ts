import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db";
import movieRoutes from "./routes/movieRoutes";
import { notFound, errorHandler } from "./middleware/errorHandler";

dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

//  Middleware 
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json());

//  Routes 
app.use("/api/movies", movieRoutes);

app.get("/", (_req, res) => {
  res.json({ message: "Movie API is running" });
});

//  Error Handling 
app.use(notFound);
app.use(errorHandler);

//  Start 
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
