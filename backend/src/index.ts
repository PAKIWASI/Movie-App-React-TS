import express from 'express'
import dotenv from 'dotenv';
import cors from 'cors'
import connectUserDB from './config/db';
import userRoutes from './routes/userRoutes'
import authRoutes from './routes/authRoutes';
import cookieParser from 'cookie-parser';
import movieRoutes from './routes/movieRoutes'
import { notFound, errorHandler } from './middleware/errorHandler';


// BACKEND ENTRY POINT
// evaluated top to bottom


dotenv.config(); // loads .env into process.env
connectUserDB(); // opens the MongoDB connection before any request hits

const app = express();                  // get the express app object
const PORT = process.env.PORT || 5000;  // set port from .env

// Global Middlewares (runs on every request, in order)

// cors allows frontend to call this backend api (kinda like IPC)
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));

// parses JSON request bodies into req.body
// if we have users and we do: 
// curl -X POST http://localhost:5000/api/users -H "Content-Type: application/json" -d '{"name":"Ali","age":25,"email":"ali@example.com"}'
// then this middleware will put the name, age and email into req.body
app.use(express.json());

// parse cookies from requests
app.use(cookieParser());


// Routes - Deciding which route to go based on url
//          Each route has many endpoints

app.use("/api/auth", authRoutes);

app.use("/api/users", userRoutes);

app.use("/api/movies/", movieRoutes);

// TODO: each user will also have a collection of movie ids as fav and watchlist
// wo we'll have seperate endpoints to add, delete those


// Health check endpoint
app.get("/", (_req, res) => {
    res.json({ message: "User API is running" });
});


// Error middleware — must come LAST, order matters
// we come here if any of the middlewares do next(error)
app.use(notFound);      // catches requests to unknown routes
app.use(errorHandler);  // catches thrown errors from any route
// we can also have local error middlewares on each of the routes


app.listen(PORT, () => {
    console.log(`Express Server running at http://localhost:${PORT}`);
})

export default app;
